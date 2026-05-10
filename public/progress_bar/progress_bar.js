

//  let value = document.querySelector('#num');
// let progress = document.querySelector('.block2');
// let button = document.querySelector('#btn');
// let start = 0 ;
// let end = 90;
// let speed = 100;

//   let timer = setInterval(function() {
//         if (start >= end) {
//             clearInterval(timer);
//         }
//         progress.style.background = `conic-gradient(#52c234 ${start * 3.6}deg, #061700 ${start * 3.6}deg, #52c234 ${start * 3.6}deg, white ${0}deg)`;
//         value.textContent = `${start}%`;
//         start++;
//     }, speed);
// button.addEventListener('click', setInterval(timer, speed));

let value = document.querySelector('#num');
let progress = document.querySelector('.block2');
let button = document.querySelector('#btn');
let start = 0;
let end = 101;
let speed = 100;
let timer = null;
let isRunning = false;

// Function to update progress
function updateProgress() {
    if (start >= end) {
        clearInterval(timer);
        isRunning = false;
        button.textContent = "Restart";
button.className = "restart";
        return;
    }
    progress.style.background = `conic-gradient(#52c234 ${start * 3.6}deg, #061700 ${start * 3.6}deg, #52c234 ${start * 3.6}deg, white ${0}deg)`;
    value.textContent = `${start}%`;
    start++;
}

// Add click event listener to button
button.addEventListener('click', function () {
   if (button.className === "restart") {
        start = 0;
        value.textContent = "0%";
        progress.style.background = "";
        timer = setInterval(updateProgress, speed);
        isRunning = true;
        button.textContent = "Pause";
        button.className = "pause";
    } else if (!isRunning) {
        // Resume the timer
        timer = setInterval(updateProgress, speed);
        isRunning = true;
        button.textContent = "Pause";
button.className = "pause";
    } else {
        // Pause the timer
        clearInterval(timer);
        isRunning = false;
        button.textContent = "Resume";
button.className = "resume";
    }
});


