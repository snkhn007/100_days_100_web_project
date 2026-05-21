const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const typingText = document.getElementById('typing-text');

/* =========================
   SPEAK FUNCTION
========================= */

function speak(text) {

    const text_speak = new SpeechSynthesisUtterance(text);

    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;

    window.speechSynthesis.speak(text_speak);
}

/* =========================
   GREETING FUNCTION
========================= */

function wishMe() {

    const hour = new Date().getHours();

    if (hour >= 0 && hour < 12) {

        speak("Good Morning Boss");

    } else if (hour >= 12 && hour < 17) {

        speak("Good Afternoon Boss");

    } else {

        speak("Good Evening Boss");
    }
}

/* =========================
   LOADING + STARTUP
========================= */

window.addEventListener('load', () => {

    speak("Initializing JARVIS");

    typingAnimation();

    setTimeout(() => {
        wishMe();
    }, 2000);
});

/* =========================
   TYPING ANIMATION
========================= */

const messages = [
    "Initializing JARVIS...",
    "AI Assistant Activated...",
    "Listening for your commands...",
    "Ready to assist you..."
];

let messageIndex = 0;
let charIndex = 0;

function typingAnimation() {

    if (!typingText) return;

    typingText.textContent =
        messages[messageIndex].slice(0, charIndex++);

    if (charIndex > messages[messageIndex].length) {

        charIndex = 0;

        messageIndex++;

        if (messageIndex >= messages.length) {
            messageIndex = 0;
        }
    }

    setTimeout(typingAnimation, 120);
}

/* =========================
   SPEECH RECOGNITION
========================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

/* =========================
   VOICE RESULT
========================= */

recognition.onresult = (event) => {

    const currentIndex = event.resultIndex;

    const transcript =
        event.results[currentIndex][0].transcript;

    content.textContent = transcript;

    takeCommand(transcript.toLowerCase());
};

/* =========================
   BUTTON CLICK
========================= */

btn.addEventListener('click', () => {

    content.textContent = "Listening...";

    btn.classList.add("active");

    recognition.start();

    speak("Listening");
});

/* =========================
   COMMAND FUNCTION
========================= */

function takeCommand(message) {

    btn.classList.remove("active");

    if (
        message.includes('hey') ||
        message.includes('hello')
    ) {

        speak("Hello Boss, How May I Help You?");

        content.textContent = "Hello Boss";

    }

    else if (message.includes("open google")) {

        window.open("https://google.com", "_blank");

        speak("Opening Google");

    }

    else if (message.includes("open youtube")) {

        window.open("https://youtube.com", "_blank");

        speak("Opening YouTube");

    }

    else if (message.includes("open facebook")) {

        window.open("https://facebook.com", "_blank");

        speak("Opening Facebook");

    }

    else if (
        message.includes('what is') ||
        message.includes('who is') ||
        message.includes('what are')
    ) {

        window.open(
            `https://www.google.com/search?q=${message}`,
            "_blank"
        );

        speak(
            "Here is what I found on the internet regarding " +
            message
        );
    }

    else if (message.includes('wikipedia')) {

        window.open(
            `https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`,
            "_blank"
        );

        speak("Opening Wikipedia");
    }

    else if (message.includes('time')) {

        const time = new Date().toLocaleString(
            undefined,
            {
                hour: "numeric",
                minute: "numeric"
            }
        );

        speak("The current time is " + time);

    }

    else if (message.includes('date')) {

        const date = new Date().toLocaleString(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        );

        speak("Today's date is " + date);

    }

    else if (message.includes('calculator')) {

        speak("Opening Calculator");

        window.open('Calculator:///');

    }

    else {

        window.open(
            `https://www.google.com/search?q=${message}`,
            "_blank"
        );

        speak(
            "I found some information for " + message
        );
    }
}