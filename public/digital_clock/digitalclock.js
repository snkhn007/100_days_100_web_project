let alarmTriggered = false;

// Start clock
setInterval(updateClock, 1000);

function updateClock() {
  const format = localStorage.getItem('clockFormat') || 'format1';
  const timezone = document.getElementById('timezone').value;

  const now = getCurrentTimeAndDate(timezone);

  switch (format) {
    case 'format1':
      showTimeFirst(now);
      break;

    case 'format2':
      showDateFirstModern(now);
      break;

    case 'format3':
      showDayFirst(now);
      break;

    default:
      showTimeFirst(now);
  }

  checkAlarm(now.rawTime);
}

function showTimeFirst(now) {
  document.getElementById('display').innerHTML =
    `${now.displayTime}<br><span class="date-size">${now.date}</span>`;
}

function showDateFirstModern(now) {
  const dateParts = now.date.split('/');
  const day = dateParts[0];
  const month = getMonthName(dateParts[1]);
  const year = dateParts[2];

  const formattedDate = `${day} ${month} ${year}`;

  document.getElementById('display').innerHTML =
    `<span class="date-size">${formattedDate}</span><br>${now.displayTime}`;
}

function showDayFirst(now) {
  document.getElementById('display').innerHTML =
    `<b>${now.day}</b><br>
     <span class="date-size">${now.date}</span><br>
     ${now.displayTime}`;
}

function getCurrentTimeAndDate(timezone) {
  let time = new Date();

  if (timezone !== 'local') {
    time = new Date(
      time.toLocaleString('en-US', { timeZone: timezone })
    );
  }

  let hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Store raw 24-hour format for alarm matching
  const rawHours = String(hours).padStart(2, '0');
  const rawMinutes = String(minutes).padStart(2, '0');

  const rawTime = `${rawHours}:${rawMinutes}`;

  // Convert for display
  let am_pm = "AM";

  if (hours >= 12) {
    am_pm = "PM";
  }

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  const displayHours = String(hours).padStart(2, '0');
  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(seconds).padStart(2, '0');

  const displayTime =
    `${displayHours}:${displayMinutes}:${displaySeconds} ${am_pm}`;

  const currentDate =
    `${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()}`;

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  return {
    displayTime,
    rawTime,
    date: currentDate,
    day: days[time.getDay()]
  };
}

function setClockStyleAndFormat(face, format) {
  localStorage.setItem('clockFormat', format);
  setClockFace(face);
  updateClock();
}

function setClockFace(face) {
  const display = document.getElementById('display');

  display.className =
    `relative font-mono text-4xl md:text-5xl 
     border-4 rounded-lg p-4 mb-4 ${face}`;

  const clock = document.getElementById('clock');

  clock.className =
    `relative font-mono text-4xl md:text-5xl 
     border-4 rounded-lg p-4 ${face}`;
}

function getMonthName(monthNumber) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  return monthNames[monthNumber - 1];
}

function toggleAlarmMode() {
  const alarmInput = document.getElementById('alarm-time');

  const confirmButton =
    document.querySelector('#alarm-container button:nth-child(3)');

  alarmInput.classList.toggle('hidden');
  confirmButton.classList.toggle('hidden');
}

function setAlarm() {
  const alarmTime = document.getElementById('alarm-time').value;

  if (!alarmTime) {
    alert("Please select a valid time.");
    return;
  }

  localStorage.setItem('alarmTime', alarmTime);

  // Reset trigger state
  alarmTriggered = false;

  // Unlock audio for browser autoplay policy
  const alarmSound = document.getElementById('alarm-sound');

  alarmSound.load();

  alarmSound.play()
    .then(() => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
    })
    .catch(() => {
      console.log("Audio initialized after user interaction.");
    });

  alert(`Alarm set for ${alarmTime}`);
}

function checkAlarm(currentTime) {
  const alarmTime = localStorage.getItem('alarmTime');

  if (
    alarmTime &&
    currentTime === alarmTime &&
    !alarmTriggered
  ) {
    alarmTriggered = true;
    triggerAlarm();
  }
}

function triggerAlarm() {
  const alarmSound = document.getElementById('alarm-sound');

  const alarmPopup =
    document.getElementById('alarm-popup');

  alarmPopup.classList.remove('hidden');

  alarmSound.loop = true;

  alarmSound.play()
    .then(() => {
      console.log("Alarm playing.");
    })
    .catch((error) => {
      console.error("Audio playback failed:", error);

      alert(
        "Browser blocked alarm sound. Please interact with the page first."
      );
    });
}

function stopAlarm() {
  const alarmSound =
    document.getElementById('alarm-sound');

  const alarmPopup =
    document.getElementById('alarm-popup');

  alarmSound.pause();
  alarmSound.currentTime = 0;

  alarmPopup.classList.add('hidden');

  localStorage.removeItem('alarmTime');

  alarmTriggered = false;
}

// Initial load
updateClock();