let generatedOTP = "";
let timerInterval;
let timeLeft = 30;
let userEmail = "";

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

// Simulate database check (replace with actual API call)
async function verifyUserDetails(enrollment, name) {
  // This is a mock function - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock database check
      if (enrollment === "12345" && name.toLowerCase() === "john doe") {
        resolve({
          success: true,
          email: "john.doe@example.com",
        });
      } else {
        resolve({
          success: false,
          message: "Invalid enrollment number or name",
        });
      }
    }, 1000);
  });
}

// Handle user details form submission
document
  .getElementById("userDetailsForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const enrollment = document.getElementById("enrollment").value;
    const name = document.getElementById("fullName").value;

    try {
      const result = await verifyUserDetails(enrollment, name);

      if (result.success) {
        userEmail = result.email;
        generatedOTP = generateOTP();

        // In a real application, you would send this OTP to the user's email
        // For demo purposes, we'll show it in an alert
        alert(
          `OTP has been sent to ${userEmail}\nFor demo purposes, your OTP is: ${generatedOTP}`
        );

        // Show OTP form and hide user details form
        this.style.display = "none";
        document.getElementById("otpForm").style.display = "flex";

        // Start timer
        startTimer();
      } else {
        showError("enrollmentError", result.message);
      }
    } catch (error) {
      showError("enrollmentError", "An error occurred. Please try again.");
    }
  });

// Handle OTP input
const otpInputs = document.querySelectorAll(".otp-input");
otpInputs.forEach((input, index) => {
  input.addEventListener("input", function () {
    if (this.value.length === 1) {
      if (index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    }
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// Handle OTP form submission
document.getElementById("otpForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const enteredOTP = Array.from(otpInputs)
    .map((input) => input.value)
    .join("");

  if (enteredOTP === generatedOTP) {
    // Show new password form and hide OTP form
    this.style.display = "none";
    document.getElementById("newPasswordForm").style.display = "flex";
    clearInterval(timerInterval);
  } else {
    showError("otpError", "Incorrect OTP. Please try again.");
    otpInputs.forEach((input) => (input.value = ""));
    otpInputs[0].focus();
  }
});

// Handle resend OTP
document.getElementById("resendBtn").addEventListener("click", function () {
  generatedOTP = generateOTP();
  alert(
    `New OTP has been sent to ${userEmail}\nFor demo purposes, your new OTP is: ${generatedOTP}`
  );
  otpInputs.forEach((input) => (input.value = ""));
  otpInputs[0].focus();
  timeLeft = 30;
  startTimer();
});

// Timer function
function startTimer() {
  const timerSpan = document.getElementById("timer");
  const resendBtn = document.getElementById("resendBtn");

  clearInterval(timerInterval);
  resendBtn.disabled = true;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerSpan.textContent = `Resend OTP in: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerSpan.textContent = "Resend OTP";
      resendBtn.disabled = false;
    }
  }, 1000);
}

// Handle new password form submission
document
  .getElementById("newPasswordForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword === confirmPassword) {
      // In a real application, you would update the password in the database
      alert("Password reset successful! Please login with your new password.");
      window.location.href = "login.html";
    } else {
      showError("passwordError", "Passwords do not match. Please try again.");
    }
  });

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", function () {
    const input = this.previousElementSibling;
    const type =
      input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);
    this.querySelector("i").classList.toggle("fa-eye");
    this.querySelector("i").classList.toggle("fa-eye-slash");
  });
});
