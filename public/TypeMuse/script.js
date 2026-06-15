const fonts = [
      { name: "Playfair Display", type: "Serif", sample: "Elegant editorial rhythm" },
      { name: "Inter", type: "Sans", sample: "Clean digital clarity" },
      { name: "Syne", type: "Display", sample: "Creative studio energy" },
      { name: "DM Serif Display", type: "Serif", sample: "Soft classic romance" },
      { name: "Space Grotesk", type: "Sans", sample: "Modern geometric voice" },
      { name: "Anton", type: "Display", sample: "Loud poster headline" },
      { name: "Libre Baskerville", type: "Serif", sample: "Literary calm texture" },
      { name: "Montserrat", type: "Sans", sample: "Polished brand system" },
      { name: "Poppins", type: "Sans", sample: "Friendly rounded balance" },
      { name: "Bebas Neue", type: "Display", sample: "Tall cinematic impact" }
    ];

    const words = [
      ["Kerning", "The space between individual letters, adjusted to make type feel balanced."],
      ["Ligature", "A graceful connection between letters that creates a smoother shape."],
      ["Serif", "A small finishing stroke that gives letters elegance, rhythm, and editorial charm."],
      ["Glyph", "A single designed character, symbol, or letterform within a typeface."],
      ["Baseline", "The invisible line letters sit on, keeping text visually grounded."]
    ];

    const gallery = document.getElementById("fontGallery");
    const fontSelect = document.getElementById("fontSelect");
    const favoritesList = document.getElementById("favoritesList");
    const preview = document.getElementById("livePreview");
    const textInput = document.getElementById("textInput");
    const sizeRange = document.getElementById("sizeRange");
    const weightRange = document.getElementById("weightRange");
    const spacingRange = document.getElementById("spacingRange");
    const sizeValue = document.getElementById("sizeValue");
    const weightValue = document.getElementById("weightValue");
    const spacingValue = document.getElementById("spacingValue");
    const toast = document.getElementById("toast");

    function splitHero() {
      const title = document.getElementById("heroTitle");
      title.innerHTML = title.textContent.split("").map((letter, index) =>
        `<span style="animation-delay:${index * 0.055}s">${letter}</span>`
      ).join("");
    }

    function getFavs() {
      return JSON.parse(localStorage.getItem("typemuseFavorites")) || [];
    }

    function setFavs(favs) {
      localStorage.setItem("typemuseFavorites", JSON.stringify(favs));
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1700);
    }

    function renderGallery() {
      const favs = getFavs();
      gallery.innerHTML = "";

      fonts.forEach(font => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <div class="card-top">
            <span class="tag">${font.type}</span>
            <button class="heart ${favs.includes(font.name) ? "active" : ""}" aria-label="Favorite ${font.name}">♥</button>
          </div>
          <div>
            <div class="font-preview" style="font-family:'${font.name}', sans-serif;">${font.sample}</div>
            <strong>${font.name}</strong>
          </div>
          <div class="card-bottom">
            <span style="color:var(--muted);font-weight:800;">Aa Bb Cc 123</span>
            <button class="pill mini-copy">CSS</button>
          </div>
        `;

        card.querySelector(".heart").addEventListener("click", () => toggleFavorite(font.name));
        card.querySelector(".mini-copy").addEventListener("click", () => {
          navigator.clipboard.writeText(`font-family: '${font.name}', sans-serif;`);
          showToast(`${font.name} CSS copied`);
        });

        gallery.appendChild(card);
      });
    }

    function renderSelect() {
      fontSelect.innerHTML = fonts.map(font => `<option value="${font.name}">${font.name}</option>`).join("");
      fontSelect.value = "Playfair Display";
    }

    function renderFavorites() {
      const favs = getFavs();
      favoritesList.innerHTML = favs.length
        ? favs.map(name => `<span class="fav-chip" style="font-family:'${name}',sans-serif;">${name}</span>`).join("")
        : `<p class="favorites-empty">No favorites yet. Tap the hearts in the gallery to save your dream fonts.</p>`;
    }

    function toggleFavorite(name) {
      const favs = getFavs();
      const next = favs.includes(name) ? favs.filter(f => f !== name) : [...favs, name];
      setFavs(next);
      renderGallery();
      renderFavorites();
      showToast(next.includes(name) ? `${name} added to favorites` : `${name} removed`);
    }

    function updatePreview() {
      preview.textContent = textInput.value || "Type something beautiful.";
      preview.style.fontFamily = `'${fontSelect.value}', sans-serif`;
      preview.style.fontSize = `${sizeRange.value}px`;
      preview.style.fontWeight = weightRange.value;
      preview.style.letterSpacing = `${spacingRange.value}px`;

      sizeValue.textContent = `${sizeRange.value}px`;
      weightValue.textContent = weightRange.value;
      spacingValue.textContent = `${spacingRange.value}px`;
    }

    function randomFont() {
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      fontSelect.value = font.name;
      textInput.value = font.sample;
      sizeRange.value = Math.floor(Math.random() * 52) + 52;
      weightRange.value = [400, 600, 700, 800, 900][Math.floor(Math.random() * 5)];
      spacingRange.value = Math.floor(Math.random() * 9) - 4;
      updatePreview();
      showToast(`Generated: ${font.name}`);
      document.getElementById("playground").scrollIntoView({ behavior: "smooth" });
    }

    function setWordOfDay() {
      const index = new Date().getDate() % words.length;
      document.getElementById("wordOfDay").textContent = words[index][0];
      document.getElementById("wordDesc").textContent = words[index][1];
    }

    function copyCSS() {
      const css = `font-family: '${fontSelect.value}', sans-serif;
font-size: ${sizeRange.value}px;
font-weight: ${weightRange.value};
letter-spacing: ${spacingRange.value}px;
line-height: 1;`;

      navigator.clipboard.writeText(css);
      showToast("Playground CSS copied");
    }

    function resetPlayground() {
      textInput.value = "Typography is visual music.";
      fontSelect.value = "Playfair Display";
      sizeRange.value = 72;
      weightRange.value = 700;
      spacingRange.value = -2;
      updatePreview();
    }

    document.getElementById("themeBtn").addEventListener("click", e => {
      const dark = document.body.dataset.theme !== "dark";
      document.body.dataset.theme = dark ? "dark" : "light";
      e.currentTarget.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });

    document.getElementById("randomBtn").addEventListener("click", randomFont);
    document.getElementById("copyBtn").addEventListener("click", copyCSS);
    document.getElementById("resetBtn").addEventListener("click", resetPlayground);

    [textInput, fontSelect, sizeRange, weightRange, spacingRange].forEach(el => {
      el.addEventListener("input", updatePreview);
    });

    document.addEventListener("mousemove", e => {
      if (Math.random() > 0.82) {
        const trail = document.createElement("span");
        trail.className = "cursor-trail";
        trail.textContent = "Aa";
        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 700);
      }
    });

    splitHero();
    setWordOfDay();
    renderSelect();
    renderGallery();
    renderFavorites();
    updatePreview();