const specialists = [
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "Orthopedic",
    "Pediatrician",
    "Psychiatrist"
];

const specialistSelect = document.getElementById("specialistType");
const specialistSearch = document.getElementById("specialistSearch");
const requestForm = document.getElementById("requestForm");
const historyList = document.getElementById("historyList");
const recommendationBox = document.getElementById("recommendationBox");
const symptomSelect = document.getElementById("symptomSelect");


// Load specialists into dropdown
function loadSpecialists(list) {

    specialistSelect.innerHTML =
        `<option value="">Select Specialist</option>`;

    list.forEach((specialist) => {

        const option = document.createElement("option");

        option.value = specialist;
        option.textContent = specialist;

        specialistSelect.appendChild(option);
    });
}

loadSpecialists(specialists);


// Live search filter
specialistSearch.addEventListener("input", () => {

    const searchValue =
        specialistSearch.value.toLowerCase();

    const filtered = specialists.filter((specialist) =>
        specialist.toLowerCase().includes(searchValue)
    );

    loadSpecialists(filtered);
});


// Consultation form submission
requestForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const doctorName =
        document.getElementById("doctorName").value;

    const patientCondition =
        document.getElementById("patientCondition").value;

    const specialist =
        specialistSelect.value;

    if (!specialist) {
        alert("Please select a specialist.");
        return;
    }

    // Create history item
    const listItem = document.createElement("li");

    listItem.innerHTML = `
        <strong>${doctorName}</strong> requested
        <strong>${specialist}</strong> consultation
        for "${patientCondition}"
    `;

    historyList.prepend(listItem);

    // Success message
    alert("✅ Consultation submitted successfully!");

    // Reset form
    requestForm.reset();
});


// Medicine recommendations
const recommendations = {

    cold: `
        <h3>Recommended Medicines</h3>
        <ul>
            <li>Paracetamol</li>
            <li>Cetirizine</li>
            <li>Steam Inhalation</li>
        </ul>
    `,

    headache: `
        <h3>Recommended Medicines</h3>
        <ul>
            <li>Ibuprofen</li>
            <li>Hydration</li>
            <li>Proper Rest</li>
        </ul>
    `,

    fever: `
        <h3>Recommended Medicines</h3>
        <ul>
            <li>Paracetamol</li>
            <li>Electrolytes</li>
            <li>Doctor Consultation</li>
        </ul>
    `,

    fatigue: `
        <h3>Recommended Suggestions</h3>
        <ul>
            <li>Vitamin Supplements</li>
            <li>Sleep Improvement</li>
            <li>Balanced Diet</li>
        </ul>
    `
};


// Symptom change
symptomSelect.addEventListener("change", () => {

    const selected =
        symptomSelect.value;

    recommendationBox.innerHTML =
        recommendations[selected] || "";
});


// Simulated live heart rate
const heartRate =
    document.getElementById("heartRate");

setInterval(() => {

    const randomRate =
        Math.floor(Math.random() * 15) + 70;

    heartRate.textContent =
        `${randomRate} BPM`;

}, 3000);


// Appointment Booking Modal Functionality
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const closeSuccessBtn = document.getElementById("closeSuccessBtn");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalSuccess = document.getElementById("modalSuccess");
const bookBtns = document.querySelectorAll(".book-btn");

const patientNameInput = document.getElementById("patientName");
const patientPhoneInput = document.getElementById("patientPhone");
const appointmentDateInput = document.getElementById("appointmentDate");
const appointmentTimeInput = document.getElementById("appointmentTime");

const nameError = document.getElementById("nameError");
const phoneError = document.getElementById("phoneError");
const dateError = document.getElementById("dateError");
const timeError = document.getElementById("timeError");

let activeTriggerButton = null;
let currentDoctor = "";
let currentSpecialty = "";

// Set min date of date picker to today
function setMinAppointmentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;

    appointmentDateInput.min = `${yyyy}-${mm}-${dd}`;
}

// Clear all validation errors
function clearErrors() {
    const errorSpans = [nameError, phoneError, dateError, timeError];
    errorSpans.forEach(span => {
        span.textContent = "";
    });

    const inputs = [patientNameInput, patientPhoneInput, appointmentDateInput, appointmentTimeInput];
    inputs.forEach(input => {
        input.classList.remove("invalid-input");
    });
}

// Open modal
function openModal(doctor, specialty, triggerButton) {
    activeTriggerButton = triggerButton;
    currentDoctor = doctor;
    currentSpecialty = specialty;

    modalSubtitle.innerHTML = `with <strong>${doctor}</strong> (${specialty})`;
    
    // Reset form and UI state
    bookingForm.reset();
    clearErrors();
    bookingForm.classList.remove("hidden");
    modalSuccess.classList.add("hidden");
    
    setMinAppointmentDate();
    
    // Show modal and lock background scrolling
    bookingModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    
    // Focus the first form input
    patientNameInput.focus();
}

// Close modal
function closeModal() {
    bookingModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    
    // Reset state
    bookingForm.reset();
    clearErrors();
    bookingForm.classList.remove("hidden");
    modalSuccess.classList.add("hidden");
    
    // Restore focus to triggering button
    if (activeTriggerButton) {
        activeTriggerButton.focus();
    }
}

// Bind open events to booking buttons
bookBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const doctor = btn.getAttribute("data-doctor");
        const specialty = btn.getAttribute("data-specialty");
        openModal(doctor, specialty, btn);
    });
});

// Bind close button actions
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
closeSuccessBtn.addEventListener("click", closeModal);

// Close on backdrop overlay click (only when clicking overlay specifically)
bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) {
        closeModal();
    }
});

// Close on Escape key press
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !bookingModal.classList.contains("hidden")) {
        closeModal();
    }
});

// Real-time input clearing of invalid state
const setupRealTimeClear = (input, errorSpan) => {
    input.addEventListener("input", () => {
        if (input.value.trim() !== "") {
            input.classList.remove("invalid-input");
            errorSpan.textContent = "";
        }
    });
};

setupRealTimeClear(patientNameInput, nameError);
setupRealTimeClear(patientPhoneInput, phoneError);
setupRealTimeClear(appointmentDateInput, dateError);
setupRealTimeClear(appointmentTimeInput, timeError);

// Submit form & validate
bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const nameVal = patientNameInput.value.trim();
    const phoneVal = patientPhoneInput.value.trim();
    const dateVal = appointmentDateInput.value;
    const timeVal = appointmentTimeInput.value;

    let isValid = true;

    // Validate Name
    if (nameVal === "") {
        nameError.textContent = "Patient name is required.";
        patientNameInput.classList.add("invalid-input");
        isValid = false;
    }

    // Validate Phone (10 digits numeric)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneVal)) {
        phoneError.textContent = "Please enter a valid 10-digit phone number.";
        patientPhoneInput.classList.add("invalid-input");
        isValid = false;
    }

    // Validate Date
    if (!dateVal) {
        dateError.textContent = "Preferred date is required.";
        appointmentDateInput.classList.add("invalid-input");
        isValid = false;
    } else {
        // Enforce today or future date in JS validation as well
        const parts = dateVal.split('-');
        const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        selectedDate.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDate < today) {
            dateError.textContent = "Date cannot be in the past.";
            appointmentDateInput.classList.add("invalid-input");
            isValid = false;
        }
    }

    // Validate Time Slot
    if (timeVal === "") {
        timeError.textContent = "Please select an available time slot.";
        appointmentTimeInput.classList.add("invalid-input");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Dynamic History Item Addition matching existing format
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <strong>${nameVal}</strong> scheduled appointment with 
        <strong>${currentDoctor}</strong> (${currentSpecialty}) on 
        <strong>${dateVal}</strong> at <strong>${timeVal}</strong>
    `;
    historyList.prepend(listItem);

    // Render persistent success banner
    const successText = modalSuccess.querySelector(".success-text");
    successText.innerHTML = `✅ <strong>Success!</strong> Appointment booked for <strong>${nameVal}</strong> with <strong>${currentDoctor}</strong> on <strong>${dateVal}</strong> at <strong>${timeVal}</strong>.`;
    
    bookingForm.classList.add("hidden");
    modalSuccess.classList.remove("hidden");
    
    // Focus the Success Close button for accessibility
    closeSuccessBtn.focus();
});
