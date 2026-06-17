/* ================================
   SplitWise Pro — app.js (Enhanced)
   Features: Equal/Unequal/Items split,
   Tip, Tax, Dark Mode, Currency switcher,
   Round-up toggle, Payment status tracker,
   Copy to clipboard, Bulk item paste,
   Live totals, Sticky mobile bar,
   Settlement Logic, History, PDF, QR, Toast
================================ */

const $ = id => document.getElementById(id);
let CURRENCY = '₹';

/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */
function showToast(msg, type = 'success') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ============================================================
   CURRENCY SWITCHER
============================================================ */
const currencyToggle = $('currencyToggle');
const currencyDropdown = $('currencyDropdown');

currencyToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  currencyDropdown.classList.toggle('open');
});

document.addEventListener('click', () => currencyDropdown.classList.remove('open'));
currencyDropdown.addEventListener('click', e => e.stopPropagation());

document.querySelectorAll('.currency-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    CURRENCY = btn.dataset.symbol;
    $('currencySymbolDisplay').textContent = CURRENCY;
    document.querySelectorAll('.currency-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update all currency labels
    document.querySelectorAll('.currency-label').forEach(el => el.textContent = CURRENCY);
    currencyDropdown.classList.remove('open');
    localStorage.setItem('swp-currency', CURRENCY);
    showToast(`Currency set to ${btn.dataset.code}`);
  });
});

// Restore saved currency
const savedCurrency = localStorage.getItem('swp-currency');
if (savedCurrency) {
  CURRENCY = savedCurrency;
  $('currencySymbolDisplay').textContent = CURRENCY;
  document.querySelectorAll('.currency-label').forEach(el => el.textContent = CURRENCY);
  document.querySelectorAll('.currency-opt').forEach(b => {
    b.classList.toggle('active', b.dataset.symbol === CURRENCY);
  });
}

/* ============================================================
   DARK MODE
============================================================ */
const darkToggle = $('darkModeToggle');
const applyTheme = (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  localStorage.setItem('swp-dark', dark ? '1' : '0');
};
const isDark = () => localStorage.getItem('swp-dark') === '1';
applyTheme(isDark());
darkToggle.addEventListener('click', () => applyTheme(!isDark()));

/* ============================================================
   TAB SWITCHING
============================================================ */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    tab.classList.add('active');
    $('tab-' + tab.dataset.tab).classList.add('active');
    updateStickyBar();
  });
});

/* ============================================================
   TIP PRESET BUTTONS (scoped per card)
============================================================ */
document.querySelectorAll('.tip-presets').forEach(group => {
  const card = group.closest('.card');
  const tipInput = card ? card.querySelector('[id$="-tip"]') : null;
  group.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (tipInput) tipInput.value = btn.dataset.tip;
      updateStickyBar();
    });
  });
});

document.querySelectorAll('[id$="-tip"], [id$="-tax"]').forEach(input => {
  input.addEventListener('input', () => {
    const card = input.closest('.card');
    if (!card) return;
    if (input.id.endsWith('-tip')) {
      card.querySelectorAll('.tip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tip == input.value);
      });
    }
    updateStickyBar();
  });
});

/* ============================================================
   STICKY MOBILE CALCULATE BAR
============================================================ */
function updateStickyBar() {
  const activeTab = document.querySelector('.tab.active')?.dataset.tab;
  const bar = $('stickyCalcBar');
  const stickyTotal = $('stickyTotal');
  const stickyBtn = $('stickyCalcBtn');

  if (window.innerWidth > 600) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';

  if (activeTab === 'equal') {
    const bill = parseFloat($('eq-bill').value) || 0;
    const tip = bill * (parseFloat($('eq-tip').value) || 0) / 100;
    const tax = bill * (parseFloat($('eq-tax').value) || 0) / 100;
    stickyTotal.textContent = `Total: ${fmt(bill + tip + tax)}`;
    stickyBtn.onclick = () => $('eq-calc').click();
  } else if (activeTab === 'unequal') {
    const bill = parseFloat($('uq-bill').value) || 0;
    const tip = bill * (parseFloat($('uq-tip').value) || 0) / 100;
    const tax = bill * (parseFloat($('uq-tax').value) || 0) / 100;
    stickyTotal.textContent = `Total: ${fmt(bill + tip + tax)}`;
    stickyBtn.onclick = () => $('uq-calc').click();
  } else if (activeTab === 'items') {
    const total = [...$('it-items').querySelectorAll('.item-price')]
      .reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
    stickyTotal.textContent = `Items: ${fmt(total)}`;
    stickyBtn.onclick = () => $('it-calc').click();
  }
}

window.addEventListener('resize', updateStickyBar);
document.querySelectorAll('input').forEach(i => i.addEventListener('input', updateStickyBar));

/* ============================================================
   PARTICIPANT HELPERS
============================================================ */
function addParticipantTag(container, name = '') {
  const div = document.createElement('div');
  div.className = 'participant-tag';
  div.innerHTML = `<input type="text" placeholder="Name" value="${name}" /><button class="remove-p" aria-label="Remove">×</button>`;
  div.querySelector('.remove-p').addEventListener('click', () => { div.remove(); refreshItemSharers(); });
  container.appendChild(div);
  div.querySelector('input').focus();
}

function addParticipantRow(container, name = '') {
  const div = document.createElement('div');
  div.className = 'participant-row';
  div.innerHTML = `
    <input type="text" placeholder="Name" value="${name}" class="p-name" />
    <div class="input-prefix sm"><span class="currency-label">${CURRENCY}</span><input type="number" placeholder="0.00" class="p-amount" min="0" step="0.01" /></div>
    <button class="remove-p" aria-label="Remove">×</button>`;
  div.querySelector('.remove-p').addEventListener('click', () => div.remove());
  div.querySelector('.p-amount').addEventListener('input', updateUqRemain);
  container.appendChild(div);
  updateUqRemain();
  div.querySelector('.p-name').focus();
}

function getParticipantNames(container, selector = 'input[type="text"]') {
  return [...container.querySelectorAll(selector)].map(i => i.value.trim() || 'Person');
}

/* Wire existing remove buttons */
document.querySelectorAll('.remove-p').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.participant-tag, .participant-row')?.remove());
});

$('eq-add-p').addEventListener('click', () => addParticipantTag($('eq-participants')));
$('uq-add-p').addEventListener('click', () => addParticipantRow($('uq-participants')));
$('it-add-p').addEventListener('click', () => {
  addParticipantTag($('it-participants'));
  refreshItemSharers();
});

/* ============================================================
   EQUAL SPLIT
============================================================ */
$('eq-bill').addEventListener('input', updateStickyBar);

$('eq-calc').addEventListener('click', () => {
  const bill = parseFloat($('eq-bill').value) || 0;
  const tipPct = parseFloat($('eq-tip').value) || 0;
  const taxPct = parseFloat($('eq-tax').value) || 0;
  const roundUp = $('eq-roundup').checked;
  const names = getParticipantNames($('eq-participants'));
  const occasion = $('eq-occasion').value.trim();

  if (!bill || !names.length) return showToast('Enter a bill amount and at least one person.', 'error');

  const tip = bill * tipPct / 100;
  const tax = bill * taxPct / 100;
  const total = bill + tip + tax;
  let per = total / names.length;
  if (roundUp) per = Math.ceil(per);

  $('eq-subtotal').textContent = fmt(bill);
  $('eq-tip-amt').textContent = fmt(tip);
  $('eq-tax-amt').textContent = fmt(tax);
  $('eq-total').textContent = fmt(total);

  // Animate per-person amount
  animateValue($('eq-per-person'), 0, per, 500, roundUp);

  // Occasion display
  const occEl = $('eq-occasion-display');
  occEl.textContent = occasion ? `🎉 ${occasion}` : '';

  // Payment status breakdown
  const bd = $('eq-breakdown');
  bd.innerHTML = '';
  const paidState = {};

  names.forEach((name, idx) => {
    paidState[name] = false;
    const d = document.createElement('div');
    d.className = 'breakdown-item';
    d.innerHTML = `
      <span class="breakdown-name">${name}</span>
      <div class="breakdown-right">
        <span class="breakdown-amt">${fmt(per)}</span>
        <button class="paid-btn" data-name="${name}" data-idx="${idx}" aria-label="Mark paid">Mark paid</button>
      </div>`;
    bd.appendChild(d);
    d.querySelector('.paid-btn').addEventListener('click', function() {
      paidState[name] = !paidState[name];
      this.classList.toggle('is-paid', paidState[name]);
      this.textContent = paidState[name] ? '✓ Paid' : 'Mark paid';
      d.classList.toggle('is-paid-row', paidState[name]);
      updatePaidCount(paidState, names.length);
    });
  });

  updatePaidCount(paidState, names.length);
  $('eq-results').style.display = 'block';
  $('eq-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  window._eqResult = { type: 'Equal Split', bill, tip, tax, total, per, names, tipPct, taxPct, roundUp, occasion };
});

function updatePaidCount(paidState, total) {
  const paid = Object.values(paidState).filter(Boolean).length;
  $('eq-paid-count').textContent = `${paid} / ${total} paid`;
  $('eq-paid-count').className = `paid-count${paid === total ? ' all-paid' : ''}`;
}

/* Animate number counting up */
function animateValue(el, start, end, duration, isRounded = false) {
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    el.textContent = fmt(isRounded ? Math.ceil(current) : current);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ============================================================
   UNEQUAL SPLIT + SETTLEMENT LOGIC
============================================================ */
function updateUqRemain() {
  const bill = parseFloat($('uq-bill').value) || 0;
  const tipPct = parseFloat($('uq-tip').value) || 0;
  const taxPct = parseFloat($('uq-tax').value) || 0;
  const total = bill + bill * tipPct / 100 + bill * taxPct / 100;
  const entered = [...$('uq-participants').querySelectorAll('.p-amount')]
    .reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const remain = total - entered;
  const info = $('uq-settle-info');
  const bar = $('uq-running-bar');
  const fill = $('uq-running-fill');
  const label = $('uq-running-label');

  if (total > 0) {
    const pct = Math.min((entered / total) * 100, 100);
    bar.style.display = 'block';
    fill.style.width = pct + '%';
    fill.style.background = remain > 0.005 ? 'var(--yellow)' : remain < -0.005 ? 'var(--accent)' : 'var(--green)';
    label.textContent = pct.toFixed(0) + '% assigned';

    info.style.display = 'block';
    $('uq-remain-label').textContent = remain > 0.005
      ? `⚠️ Unassigned: ${fmt(remain)} remaining`
      : remain < -0.005
      ? `⚠️ Over by ${fmt(Math.abs(remain))}`
      : `✅ Fully assigned`;
  } else {
    info.style.display = 'none';
    bar.style.display = 'none';
  }
  updateStickyBar();
}

$('uq-bill').addEventListener('input', updateUqRemain);
$('uq-tip').addEventListener('input', updateUqRemain);
$('uq-tax').addEventListener('input', updateUqRemain);
$('uq-participants').addEventListener('input', updateUqRemain);

$('uq-calc').addEventListener('click', () => {
  const bill = parseFloat($('uq-bill').value) || 0;
  const tipPct = parseFloat($('uq-tip').value) || 0;
  const taxPct = parseFloat($('uq-tax').value) || 0;
  const roundUp = $('uq-roundup').checked;
  const total = bill + bill * tipPct / 100 + bill * taxPct / 100;
  if (!bill) return showToast('Enter a bill amount.', 'error');

  const rows = [...$('uq-participants').querySelectorAll('.participant-row')];
  if (!rows.length) return showToast('Add at least one participant.', 'error');

  const participants = rows.map(r => ({
    name: r.querySelector('.p-name')?.value.trim() || 'Person',
    paid: parseFloat(r.querySelector('.p-amount')?.value) || 0
  }));

  const sumPaid = participants.reduce((s, p) => s + p.paid, 0);
  const people = participants.map(p => ({
    name: p.name,
    owes: sumPaid > 0 ? (p.paid / sumPaid) * total : total / participants.length
  }));

  if (roundUp) people.forEach(p => p.owes = Math.ceil(p.owes));

  const settlements = settleDebts(people.map(p => ({ name: p.name, balance: p.paid - p.owes })));

  // Summary grid
  $('uq-subtotal').textContent = fmt(bill);
  $('uq-tip-display').textContent = fmt(bill * tipPct / 100);
  $('uq-tax-display').textContent = fmt(bill * taxPct / 100);
  $('uq-total-display').textContent = fmt(total);

  const sl = $('uq-settlement');
  sl.innerHTML = '';
  if (settlements.length === 0) {
    sl.innerHTML = `<div class="breakdown-item"><span>Everyone is square! ✅</span></div>`;
  } else {
    settlements.forEach(s => {
      const d = document.createElement('div');
      d.className = 'settle-row';
      d.innerHTML = `
        <span class="settle-from">${s.from}</span>
        <span class="settle-arrow">pays →</span>
        <span class="settle-to">${s.to}</span>
        <span class="settle-amt">${fmt(s.amount)}</span>`;
      sl.appendChild(d);
    });
  }

  $('uq-results').style.display = 'block';
  $('uq-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  window._uqResult = { type: 'Custom Split', bill, tipPct, taxPct, total, settlements, people, occasion: $('uq-occasion').value.trim() };
});

/* ============================================================
   SETTLEMENT ALGORITHM (simplify debts)
============================================================ */
function settleDebts(balances) {
  const creditors = [], debtors = [];
  balances.forEach(b => {
    if (b.balance > 0.005) creditors.push({ ...b });
    else if (b.balance < -0.005) debtors.push({ ...b, balance: Math.abs(b.balance) });
  });
  const txns = [];
  while (creditors.length && debtors.length) {
    const c = creditors[0], d = debtors[0];
    const amount = Math.min(c.balance, d.balance);
    txns.push({ from: d.name, to: c.name, amount: +amount.toFixed(2) });
    c.balance -= amount;
    d.balance -= amount;
    if (c.balance < 0.005) creditors.shift();
    if (d.balance < 0.005) debtors.shift();
  }
  return txns;
}

/* ============================================================
   ITEMS SPLIT
============================================================ */
function getItParticipants() {
  return [...$('it-participants').querySelectorAll('input[type="text"]')]
    .map(i => i.value.trim() || 'Person');
}

function updateItemsLiveTotal() {
  const total = [...$('it-items').querySelectorAll('.item-price')]
    .reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  $('it-live-amount').textContent = fmt(total);
  updateStickyBar();
}

function addItem(name = '', price = '') {
  const names = getItParticipants();
  const div = document.createElement('div');
  div.className = 'item-row';
  const sharers = names.map(n => `
    <label class="sharer-check checked">
      <input type="checkbox" checked data-name="${n}" />
      ${n}
    </label>`).join('');

  div.innerHTML = `
    <div class="item-row-header">
      <input type="text" placeholder="Item name" class="item-name" value="${name}" />
      <div class="input-prefix sm"><span class="currency-label">${CURRENCY}</span><input type="number" placeholder="0.00" class="item-price" min="0" step="0.01" value="${price}" /></div>
      <button class="remove-p" aria-label="Remove item">×</button>
    </div>
    <div class="item-sharers">${sharers}</div>`;

  div.querySelector('.remove-p').addEventListener('click', () => { div.remove(); updateItemsLiveTotal(); });
  div.querySelector('.item-price').addEventListener('input', updateItemsLiveTotal);
  div.querySelectorAll('.sharer-check').forEach(lbl => {
    lbl.querySelector('input').addEventListener('change', (e) => {
      lbl.classList.toggle('checked', e.target.checked);
    });
  });

  $('it-items').appendChild(div);
  updateItemsLiveTotal();
}

function refreshItemSharers() {
  const names = getItParticipants();
  $('it-items').querySelectorAll('.item-row').forEach(row => {
    const existing = {};
    row.querySelectorAll('.sharer-check').forEach(lbl => {
      existing[lbl.querySelector('input').dataset.name] = lbl.classList.contains('checked');
    });
    const sharers = names.map(n => {
      const isChecked = existing[n] !== false;
      return `<label class="sharer-check ${isChecked ? 'checked' : ''}">
        <input type="checkbox" ${isChecked ? 'checked' : ''} data-name="${n}" />${n}</label>`;
    }).join('');
    row.querySelector('.item-sharers').innerHTML = sharers;
    row.querySelectorAll('.sharer-check').forEach(lbl => {
      lbl.querySelector('input').addEventListener('change', (e) => {
        lbl.classList.toggle('checked', e.target.checked);
      });
    });
  });
}

$('it-add-item').addEventListener('click', () => addItem());
$('it-participants').addEventListener('change', refreshItemSharers);

// Add 2 default items
addItem(); addItem();

$('it-calc').addEventListener('click', () => {
  const names = getItParticipants();
  const tipPct = parseFloat($('it-tip').value) || 0;
  const taxPct = parseFloat($('it-tax').value) || 0;

  const items = [...$('it-items').querySelectorAll('.item-row')].map(row => {
    const name = row.querySelector('.item-name').value.trim() || 'Item';
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const sharers = [...row.querySelectorAll('.sharer-check.checked input')].map(i => i.dataset.name);
    return { name, price, sharers };
  }).filter(i => i.price > 0);

  if (!items.length) return showToast('Add at least one item with a price.', 'error');

  const totals = {};
  names.forEach(n => totals[n] = { items: [], subtotal: 0 });

  items.forEach(item => {
    if (!item.sharers.length) return;
    const share = item.price / item.sharers.length;
    item.sharers.forEach(n => {
      if (!totals[n]) totals[n] = { items: [], subtotal: 0 };
      totals[n].items.push({ name: item.name, amount: share });
      totals[n].subtotal += share;
    });
  });

  const grandSubtotal = Object.values(totals).reduce((s, p) => s + p.subtotal, 0);
  const tipTotal = grandSubtotal * tipPct / 100;
  const taxTotal = grandSubtotal * taxPct / 100;

  Object.keys(totals).forEach(n => {
    const tipShare = grandSubtotal > 0 ? (totals[n].subtotal / grandSubtotal) * tipTotal : 0;
    const taxShare = grandSubtotal > 0 ? (totals[n].subtotal / grandSubtotal) * taxTotal : 0;
    totals[n].total = totals[n].subtotal + tipShare + taxShare;
    totals[n].tipShare = tipShare;
    totals[n].taxShare = taxShare;
  });

  const bd = $('it-breakdown');
  bd.innerHTML = '';
  Object.entries(totals).forEach(([name, data]) => {
    if (!data.items.length) return;
    const card = document.createElement('div');
    card.className = 'ppi-card';
    const itemsHtml = data.items.map(i =>
      `<div class="ppi-item"><span>${i.name}</span><span>${fmt(i.amount)}</span></div>`
    ).join('');
    const tipHtml = data.tipShare > 0
      ? `<div class="ppi-item tip-row"><span>Tip (${tipPct}%)</span><span>${fmt(data.tipShare)}</span></div>` : '';
    const taxHtml = data.taxShare > 0
      ? `<div class="ppi-item tax-row"><span>Tax (${taxPct}%)</span><span>${fmt(data.taxShare)}</span></div>` : '';
    card.innerHTML = `
      <div class="ppi-header">
        <span class="ppi-name">${name}</span>
        <span class="ppi-total">${fmt(data.total)}</span>
      </div>
      <div class="ppi-items">${itemsHtml}${tipHtml}${taxHtml}</div>`;
    bd.appendChild(card);
  });

  const maxPayer = Object.entries(totals).reduce((a, b) => b[1].total > a[1].total ? b : a);
  const settlements = [];
  Object.entries(totals).forEach(([name, data]) => {
    if (name !== maxPayer[0] && data.total > 0.005) {
      settlements.push({ from: name, to: maxPayer[0], amount: +data.total.toFixed(2) });
    }
  });

  const sl = $('it-settlement');
  sl.innerHTML = `<h3 class="section-title" style="margin-top:0">💸 Settlement</h3>`;
  if (!settlements.length) {
    sl.innerHTML += `<div class="breakdown-item"><span>Only one person! ✅</span></div>`;
  } else {
    settlements.forEach(s => {
      const d = document.createElement('div');
      d.className = 'settle-row';
      d.innerHTML = `
        <span class="settle-from">${s.from}</span>
        <span class="settle-arrow">pays →</span>
        <span class="settle-to">${s.to}</span>
        <span class="settle-amt">${fmt(s.amount)}</span>`;
      sl.appendChild(d);
    });
  }

  $('it-results').style.display = 'block';
  $('it-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  window._itResult = { type: 'Items Split', items, totals, settlements, tipPct, taxPct, occasion: $('it-occasion').value.trim() };
});

/* ============================================================
   BULK PASTE ITEMS
============================================================ */
$('it-bulk-paste').addEventListener('click', () => {
  $('bulkModalOverlay').classList.add('open');
  $('bulkPasteArea').focus();
});

$('closeBulk').addEventListener('click', () => $('bulkModalOverlay').classList.remove('open'));
$('bulkModalOverlay').addEventListener('click', e => {
  if (e.target === $('bulkModalOverlay')) $('bulkModalOverlay').classList.remove('open');
});

$('bulkAddBtn').addEventListener('click', () => {
  const lines = $('bulkPasteArea').value.trim().split('\n').filter(l => l.trim());
  let added = 0;
  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const price = parseFloat(parts[parts.length - 1].trim().replace(/[^\d.]/g, ''));
      if (name && !isNaN(price) && price > 0) {
        addItem(name, price);
        added++;
      }
    }
  });
  $('bulkModalOverlay').classList.remove('open');
  $('bulkPasteArea').value = '';
  if (added) showToast(`Added ${added} item${added > 1 ? 's' : ''}!`);
  else showToast('No valid items found. Format: Name, Price', 'error');
});

/* ============================================================
   FORMATTING HELPER
============================================================ */
function fmt(n) {
  return CURRENCY + (n || 0).toFixed(2);
}

/* ============================================================
   COPY TO CLIPBOARD
============================================================ */
function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast('Copied to clipboard! 📋'),
    () => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('Copied to clipboard! 📋');
    }
  );
}

$('eq-copy').addEventListener('click', () => {
  const r = window._eqResult;
  if (!r) return showToast('Calculate first!', 'error');
  const lines = [
    r.occasion ? `🎉 ${r.occasion}` : '',
    `SplitWise Pro — Equal Split`,
    `Subtotal: ${fmt(r.bill)}`,
    r.tipPct > 0 ? `Tip (${r.tipPct}%): ${fmt(r.tip)}` : '',
    r.taxPct > 0 ? `Tax (${r.taxPct}%): ${fmt(r.tax)}` : '',
    `Grand Total: ${fmt(r.total)}`,
    ``,
    `Each person pays: ${fmt(r.per)}`,
    `Participants: ${r.names.join(', ')}`
  ].filter(Boolean).join('\n');
  copyText(lines);
});

$('uq-copy').addEventListener('click', () => {
  const r = window._uqResult;
  if (!r) return showToast('Calculate first!', 'error');
  const lines = [
    r.occasion ? `🎉 ${r.occasion}` : '',
    `SplitWise Pro — Custom Split`,
    `Total: ${fmt(r.total)}`,
    ``,
    `Settlement:`,
    ...(r.settlements.length
      ? r.settlements.map(s => `  ${s.from} → ${s.to}: ${fmt(s.amount)}`)
      : ['  Everyone is square! ✅'])
  ].filter(Boolean).join('\n');
  copyText(lines);
});

$('it-copy').addEventListener('click', () => {
  const r = window._itResult;
  if (!r) return showToast('Calculate first!', 'error');
  const perPerson = Object.entries(r.totals)
    .filter(([, d]) => d.total > 0)
    .map(([n, d]) => `  ${n}: ${fmt(d.total)}`).join('\n');
  const lines = [
    r.occasion ? `🎉 ${r.occasion}` : '',
    `SplitWise Pro — Items Split`,
    ``,
    `Per Person:`,
    perPerson,
    ``,
    `Settlement:`,
    ...(r.settlements.length
      ? r.settlements.map(s => `  ${s.from} → ${s.to}: ${fmt(s.amount)}`)
      : ['  Only one person! ✅'])
  ].filter(Boolean).join('\n');
  copyText(lines);
});

/* ============================================================
   HISTORY (localStorage)
============================================================ */
const HISTORY_KEY = 'swp-history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(entry) {
  const hist = getHistory();
  hist.unshift({ ...entry, id: Date.now(), date: new Date().toLocaleDateString() });
  if (hist.length > 30) hist.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  renderHistory();
}

function renderHistory() {
  const list = $('historyList');
  const hist = getHistory();
  if (!hist.length) {
    list.innerHTML = `
      <div class="empty-history">
        <div class="empty-icon">📂</div>
        <div class="empty-title">No splits yet</div>
        <div class="empty-sub">Hit 💾 Save after calculating to keep a record here.</div>
      </div>`;
    return;
  }
  list.innerHTML = '';
  hist.forEach(h => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-meta">
        <span class="history-type">${h.type}</span>
        <span class="history-date">${h.date}</span>
      </div>
      <div class="history-title">${h.occasion ? `🎉 ${h.occasion} — ` : ''}${h.summary || 'Split'}</div>
      <div class="history-sub">${h.detail || ''}</div>`;
    list.appendChild(item);
  });
}

$('historyToggle').addEventListener('click', () => {
  renderHistory();
  $('historyDrawer').classList.add('open');
  $('drawerOverlay').classList.add('open');
});

$('closeDrawer').addEventListener('click', closeDrawer);
$('drawerOverlay').addEventListener('click', closeDrawer);
function closeDrawer() {
  $('historyDrawer').classList.remove('open');
  $('drawerOverlay').classList.remove('open');
}

$('clearHistory').addEventListener('click', () => {
  if (confirm('Clear all history?')) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast('History cleared');
  }
});

/* ============================================================
   SAVE BUTTONS
============================================================ */
$('eq-save').addEventListener('click', () => {
  const r = window._eqResult;
  if (!r) return showToast('Calculate first!', 'error');
  saveHistory({ type: r.type, occasion: r.occasion, summary: `Total ${fmt(r.total)} ÷ ${r.names.length} people`, detail: `Each pays ${fmt(r.per)}` });
  showToast('Saved to history! 💾');
});

$('uq-save').addEventListener('click', () => {
  const r = window._uqResult;
  if (!r) return showToast('Calculate first!', 'error');
  saveHistory({ type: r.type, occasion: r.occasion, summary: `Total ${fmt(r.total)}`, detail: `${r.settlements.length} settlement(s)` });
  showToast('Saved to history! 💾');
});

$('it-save').addEventListener('click', () => {
  const r = window._itResult;
  if (!r) return showToast('Calculate first!', 'error');
  saveHistory({ type: r.type, occasion: r.occasion, summary: `${r.items.length} items`, detail: `${r.settlements.length} settlement(s)` });
  showToast('Saved to history! 💾');
});

/* ============================================================
   PDF EXPORT
============================================================ */
function generatePDF(title, lines, occasion = '') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;

  doc.setFillColor(192, 57, 43);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SplitWise Pro', margin, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), 210 - margin, 14, { align: 'right' });
  if (occasion) {
    doc.setFontSize(11);
    doc.text(`🎉 ${occasion}`, margin, 24);
  }
  y = 42;

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 10;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  lines.forEach(line => {
    if (y > 270) { doc.addPage(); y = 20; }
    if (line.type === 'header') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(192, 57, 43);
      doc.text(line.text, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      y += 8;
    } else if (line.type === 'row') {
      doc.text(line.left, margin, y);
      doc.text(line.right, 210 - margin, y, { align: 'right' });
      y += 7;
    } else if (line.type === 'divider') {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, 210 - margin, y);
      y += 5;
    } else {
      doc.text(line.text || '', margin, y);
      y += 7;
    }
  });

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by SplitWise Pro', 105, 290, { align: 'center' });
  doc.save(`splitwise-${Date.now()}.pdf`);
}

$('eq-pdf').addEventListener('click', () => {
  const r = window._eqResult;
  if (!r) return showToast('Calculate first!', 'error');
  const lines = [
    { type: 'header', text: 'Bill Summary' },
    { type: 'row', left: 'Subtotal', right: fmt(r.bill) },
    { type: 'row', left: `Tip (${r.tipPct}%)`, right: fmt(r.tip) },
    { type: 'row', left: `Tax (${r.taxPct}%)`, right: fmt(r.tax) },
    { type: 'row', left: 'Grand Total', right: fmt(r.total) },
    { type: 'divider' },
    { type: 'header', text: 'Per Person Breakdown' },
    ...r.names.map(n => ({ type: 'row', left: n, right: fmt(r.per) }))
  ];
  generatePDF('Equal Split Summary', lines, r.occasion);
});

$('uq-pdf').addEventListener('click', () => {
  const r = window._uqResult;
  if (!r) return showToast('Calculate first!', 'error');
  const lines = [
    { type: 'header', text: 'Bill Summary' },
    { type: 'row', left: 'Subtotal', right: fmt(r.bill) },
    { type: 'row', left: `Tip (${r.tipPct}%)`, right: fmt(r.bill * r.tipPct / 100) },
    { type: 'row', left: `Tax (${r.taxPct}%)`, right: fmt(r.bill * r.taxPct / 100) },
    { type: 'row', left: 'Grand Total', right: fmt(r.total) },
    { type: 'divider' },
    { type: 'header', text: 'Settlement — Who Owes Whom' },
    ...(r.settlements.length
      ? r.settlements.map(s => ({ type: 'row', left: `${s.from} → ${s.to}`, right: fmt(s.amount) }))
      : [{ type: 'text', text: 'Everyone is square!' }])
  ];
  generatePDF('Custom Split Summary', lines, r.occasion);
});

$('it-pdf').addEventListener('click', () => {
  const r = window._itResult;
  if (!r) return showToast('Calculate first!', 'error');
  const lines = [
    { type: 'header', text: 'Items' },
    ...r.items.map(i => ({ type: 'row', left: `${i.name} (${i.sharers.join(', ')})`, right: fmt(i.price) })),
    { type: 'divider' },
    { type: 'header', text: 'Per Person' },
    ...Object.entries(r.totals).filter(([, d]) => d.total > 0).map(([n, d]) => ({ type: 'row', left: n, right: fmt(d.total) })),
    { type: 'divider' },
    { type: 'header', text: 'Settlement' },
    ...(r.settlements.length
      ? r.settlements.map(s => ({ type: 'row', left: `${s.from} → ${s.to}`, right: fmt(s.amount) }))
      : [{ type: 'text', text: 'Only one person!' }])
  ];
  generatePDF('Items Split Summary', lines, r.occasion);
});

/* ============================================================
   QR SHARE
============================================================ */
function showQR(summaryText) {
  $('qrcode').innerHTML = '';
  const encoded = encodeURIComponent(summaryText);
  const url = `https://splitwise-pro.share/?data=${encoded.slice(0, 800)}`;
  $('qr-url-text').textContent = summaryText.slice(0, 120) + (summaryText.length > 120 ? '…' : '');
  try {
    new QRCode($('qrcode'), {
      text: url,
      width: 220, height: 220,
      colorDark: '#1a1714',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (e) {
    $('qrcode').innerHTML = '<p style="color:red;font-size:12px">QR lib not loaded</p>';
  }
  $('qrModalOverlay').classList.add('open');
}

$('closeQr').addEventListener('click', () => $('qrModalOverlay').classList.remove('open'));
$('qrModalOverlay').addEventListener('click', e => {
  if (e.target === $('qrModalOverlay')) $('qrModalOverlay').classList.remove('open');
});

$('eq-qr').addEventListener('click', () => {
  const r = window._eqResult;
  if (!r) return showToast('Calculate first!', 'error');
  const text = `SplitWise Pro - Equal Split\n${r.occasion ? r.occasion + '\n' : ''}Total: ${fmt(r.total)}\nPeople: ${r.names.join(', ')}\nEach pays: ${fmt(r.per)}`;
  showQR(text);
});

$('uq-qr').addEventListener('click', () => {
  const r = window._uqResult;
  if (!r) return showToast('Calculate first!', 'error');
  const lines = r.settlements.map(s => `${s.from} → ${s.to}: ${fmt(s.amount)}`).join('\n');
  showQR(`SplitWise Pro - Custom Split\n${r.occasion ? r.occasion + '\n' : ''}Total: ${fmt(r.total)}\n\nSettlement:\n${lines || 'All square!'}`);
});

$('it-qr').addEventListener('click', () => {
  const r = window._itResult;
  if (!r) return showToast('Calculate first!', 'error');
  const perPerson = Object.entries(r.totals)
    .filter(([, d]) => d.total > 0)
    .map(([n, d]) => `${n}: ${fmt(d.total)}`).join('\n');
  showQR(`SplitWise Pro - Items Split\n${r.occasion ? r.occasion + '\n' : ''}\nPer Person:\n${perPerson}`);
});

/* ============================================================
   INPUT VALIDATION — clamp negatives and over-max values
============================================================ */
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    if (isNaN(val)) return;
    if (val < 0) input.value = 0;
    else if (input.max !== '' && val > parseFloat(input.max)) input.value = input.max;
  });
});

/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const activeTab = document.querySelector('.tab.active')?.dataset.tab;
    if (activeTab === 'equal') $('eq-calc').click();
    else if (activeTab === 'unequal') $('uq-calc').click();
    else if (activeTab === 'items') $('it-calc').click();
  }
  if (e.key === 'Escape') {
    $('qrModalOverlay').classList.remove('open');
    $('bulkModalOverlay').classList.remove('open');
    closeDrawer();
  }
});

/* Init */
updateStickyBar();