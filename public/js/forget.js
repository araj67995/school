let generatedOTP = "";
let otpGeneratedTime = null; // store time when OTP was generated
let resendCount = 0; // counts number of resends
const RESEND_LIMIT = 5; // max 5 attempts
let canResend = true;
let otpValidityInterval;
let userEmail = "";
let isOTPSending = false;
let coolDownTimeout = null;
let resendTimerInterval = null;
const RESEND_COOLDOWN_MS = 30000;

const Users = UserData.map((foundItem) => ({
  id: foundItem.id,
  email: foundItem.email,
  name: foundItem.name,
}));

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function startTimer(durationMs = RESEND_COOLDOWN_MS) {
  const timerEl = document.getElementById("timer");
  const resendBtn = document.getElementById("resendBtn");

  // Clear any running timer
  clearInterval(resendTimerInterval);

  // Ensure UI starts in disabled state
  if (resendBtn) resendBtn.setAttribute("disabled", "disabled");

  let remaining = Math.ceil(durationMs / 1000);
  if (timerEl) timerEl.textContent = `Resend OTP in: ${remaining}s`;

  resendTimerInterval = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      if (timerEl) timerEl.textContent = `Resend OTP in: ${remaining}s`;
    } else {
      clearInterval(resendTimerInterval);
      if (timerEl) timerEl.textContent = "You can resend OTP now";
      if (resendBtn) resendBtn.removeAttribute("disabled");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(resendTimerInterval);
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = "";
}

async function issueOTP(isResend = false) {
  if (isOTPSending) return;
  if (!userEmail) {
    showError("otpError", "No recipient email found. Please verify details again.");
    return;
  }
  isOTPSending = true;

  document.getElementById("sendOtpBtn")?.setAttribute("disabled", "disabled");
  document.getElementById("resendBtn")?.setAttribute("disabled", "disabled");

  if (isResend) resendCount += 1;

  generatedOTP = generateOTP();
  otpGeneratedTime = Date.now();
  canResend = false;

  try {
    await sendOtpToUser(
      userEmail,
      generatedOTP,
      document.getElementById("fullName").value
    );

    // Show resend info message only on resend
    if (isResend) {
      showError("otpError", "OTP resent. Please check your email or spam folder.");
    }

    // Start 30s visible countdown
    startTimer(RESEND_COOLDOWN_MS);

    // Maintain existing cooldown/unlock logic
    if (coolDownTimeout) clearTimeout(coolDownTimeout);
    coolDownTimeout = setTimeout(() => {
      canResend = true;
      isOTPSending = false;
      if (resendCount < RESEND_LIMIT) {
        document.getElementById("resendBtn")?.removeAttribute("disabled");
      }
      document.getElementById("sendOtpBtn")?.removeAttribute("disabled");
    }, RESEND_COOLDOWN_MS);

    // OTP expiry (5 min)
    clearTimeout(otpValidityInterval);
    otpValidityInterval = setTimeout(() => {
      generatedOTP = "";
      showError("otpError", "OTP expired. Please request a new OTP.");
    }, 300000);
  } catch (e) {
    isOTPSending = false;
    // Stop the timer if started and re-enable buttons carefully
    stopTimer();
    showError("otpError", "Failed to send OTP. Please try again.");
    // Allow user to attempt again
    document.getElementById("sendOtpBtn")?.removeAttribute("disabled");
    if (resendCount < RESEND_LIMIT) {
      document.getElementById("resendBtn")?.removeAttribute("disabled");
    }
  }
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

// send user data to backend
async function sendOtpToUser(email, otp, name) {
  if (!email) throw new Error("Missing recipient email");
  const res = await fetch("/forget/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, name }),
  });
  if (!res.ok) throw new Error("Failed to send OTP");
}


async function verifyUserDetails(enrollment, name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = Users.find((d) => d.id === enrollment);

      if (!user) {
        resolve({
          success: false,
          message: "Invalid enrollment number or name",
        });
        return;
      }

      // Only set userId when user exists
      const userIdEl = document.getElementById("userId");
      if (userIdEl) userIdEl.value = user.id;

      if (name && name.toLowerCase().trim() === user.name.toLowerCase().trim()) {
        resolve({
          success: true,
          email: user.email,
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
document.getElementById("userDetailsForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const enrollment = document.getElementById("enrollment").value;
  const name = document.getElementById("fullName").value;

  const result = await verifyUserDetails(enrollment, name);
  if (result.success) {
    userEmail = result.email;
    resendCount = 0;
    canResend = true;

    await issueOTP(false); // startTimer is invoked inside issueOTP upon success

    this.style.display = "none";
    document.getElementById("otpForm").style.display = "flex";
    document.getElementById("sendOtpBtn")?.setAttribute("disabled", "disabled");
  } else {
    showError("enrollmentError", result.message);
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
// On successful OTP verification
document.getElementById("otpForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const enteredOTP = Array.from(otpInputs).map((i) => i.value).join("");

  if (!generatedOTP || Date.now() - otpGeneratedTime > 300000) {
    showError("otpError", "OTP has expired. Please request a new OTP.");
    otpInputs.forEach((input) => (input.value = ""));
    otpInputs[0].focus();
    return;
  }

  if (enteredOTP === generatedOTP) {
    // Stop the resend timer since flow is moving forward
    stopTimer();

    this.style.display = "none";
    document.getElementById("newPasswordForm").style.display = "flex";
    clearTimeout(otpValidityInterval);
  } else {
    showError("otpError", "Incorrect OTP. Please try again.");
    otpInputs.forEach((input) => (input.value = ""));
    otpInputs[0].focus();
  }
});

// On resend click (issueOTP(true) will start the timer again)
document.getElementById("resendBtn").addEventListener("click", async function () {
  if (!canResend || isOTPSending) {
    showError("otpError", "Please wait 30 seconds before requesting a new OTP.");
    return;
  }
  if (resendCount >= RESEND_LIMIT) {
    showError("otpError", "Maximum OTP resend limit reached, Try later.");
    return;
  }
  otpInputs.forEach((input) => (input.value = ""));
  otpInputs[0].focus();

  await issueOTP(true);
});


// Handle resend OTP
document
  .getElementById("resendBtn")
  .addEventListener("click", async function () {
    if (!canResend || isOTPSending) {
      showError(
        "otpError",
        "Please wait 30 seconds before requesting a new OTP."
      );
      return;
    }
    if (resendCount >= RESEND_LIMIT) {
      showError("otpError", "Maximum OTP resend limit reached, Try later.");
      return;
    }
    otpInputs.forEach((input) => (input.value = ""));
    otpInputs[0].focus();

    await issueOTP(true); // isResend=true
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

document
  .getElementById("sendOtpBtn")
  .addEventListener("click", async function () {
    if (isOTPSending || !canResend) return;
    await issueOTP(false);
  });
