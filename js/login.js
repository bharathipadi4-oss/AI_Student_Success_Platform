
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("login-password");
const emailInput = document.getElementById("login-email");
const message = document.getElementById("login-message");
const togglePassword = document.getElementById("toggle-password");

// Show / Hide password
togglePassword.addEventListener("click", function () {
  const showing = passwordInput.type === "text";

  passwordInput.type = showing ? "password" : "text";
  togglePassword.textContent = showing ? "Show" : "Hide";
});

// Login form submission
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!emailInput.checkValidity() || password.length < 4) {
    message.textContent =
      "Enter a valid email and a password of at least 4 characters.";
    return;
  }

  // Demo login only — this does not verify credentials
 localStorage.setItem("userEmail", email);
localStorage.setItem("userName", email.split("@")[0]);

  // Open the dashboard
  window.location.href = "./index.html";
});