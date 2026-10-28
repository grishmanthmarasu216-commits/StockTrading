/**
 * TradeNest Authentication Pages Logic (Login, Sign-up, Forgot Password)
 * Integrated with TradeNest Backend REST API and JWT Authentication
 */

import { showToast } from "../components/toast.js";
import { authAPI } from "../utils/api.js";

export function initLoginPage() {
  const form = document.getElementById("login-form");
  const quickDemoBtn = document.getElementById("btn-quick-demo");
  const togglePassBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  const userIdInput = document.getElementById("client-id");
  const pinInput = document.getElementById("pin");

  // Toggle password visibility
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassBtn.textContent = type === "password" ? "Show" : "Hide";
    });
  }

  // Quick Demo Autofill
  if (quickDemoBtn && userIdInput && passwordInput && pinInput) {
    quickDemoBtn.addEventListener("click", () => {
      userIdInput.value = "TN1024";
      passwordInput.value = "demo1234";
      pinInput.value = "123456";
      showToast("Demo credentials filled: TN1024 / demo1234", "info");
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const clientId = userIdInput.value.trim();
      const password = passwordInput.value;
      const pin = pinInput.value.trim();

      let isValid = true;

      // Validate Client ID
      if (!clientId) {
        showError(userIdInput, "Please enter your Client ID or Email");
        isValid = false;
      } else {
        clearError(userIdInput);
      }

      // Validate Password
      if (!password || password.length < 4) {
        showError(passwordInput, "Password must be at least 4 characters");
        isValid = false;
      } else {
        clearError(passwordInput);
      }

      // Validate PIN
      if (!pin || pin.length < 4) {
        showError(pinInput, "Please enter your 4-6 digit security PIN");
        isValid = false;
      } else {
        clearError(pinInput);
      }

      if (!isValid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "Login";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Authenticating...";
      }

      try {
        const data = await authAPI.login({ identifier: clientId, password });
        showToast(`Welcome back, ${data.user.name}! Redirecting to workspace...`, "success", 2000);
        setTimeout(() => {
          window.location.href = "./dashboard.html";
        }, 800);
      } catch (err) {
        showToast(err.message || "Login failed. Please check your credentials.", "danger", 4000);
        showError(passwordInput, err.message || "Invalid credentials");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }
}

export function initSignupPage() {
  const form = document.getElementById("signup-form");
  const mobileInput = document.getElementById("mobile");
  const nameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isValid = true;

      if (!mobileInput.value || mobileInput.value.length < 10) {
        showError(mobileInput, "Enter a valid 10-digit mobile number");
        isValid = false;
      } else {
        clearError(mobileInput);
      }

      if (!nameInput.value.trim()) {
        showError(nameInput, "Enter your full name as per PAN");
        isValid = false;
      } else {
        clearError(nameInput);
      }

      if (!emailInput.value || !emailInput.value.includes("@")) {
        showError(emailInput, "Enter a valid email address");
        isValid = false;
      } else {
        clearError(emailInput);
      }

      if (!passInput.value || passInput.value.length < 6) {
        showError(passInput, "Password must be at least 6 characters");
        isValid = false;
      } else {
        clearError(passInput);
      }

      if (!isValid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.innerHTML : "Create Account";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Creating Account...";
      }

      try {
        const data = await authAPI.register({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passInput.value,
          phone: mobileInput.value.trim()
        });

        showToast(`Registration successful! Your Client ID is ${data.user.clientId}`, "success", 3000);
        setTimeout(() => {
          window.location.href = "./dashboard.html";
        }, 1200);
      } catch (err) {
        showToast(err.message || "Registration failed.", "danger", 4000);
        if (err.message && err.message.includes("email")) {
          showError(emailInput, err.message);
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
      }
    });
  }
}

export function initForgotPasswordPage() {
  const form = document.getElementById("forgot-form");
  const identifierInput = document.getElementById("identifier");
  const messageBox = document.getElementById("reset-message-box");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const identifier = identifierInput.value.trim();
      if (!identifier) {
        showError(identifierInput, "Please enter your registered Client ID or Email");
        return;
      }

      clearError(identifierInput);

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

      try {
        const res = await authAPI.forgotPassword(identifier);
        if (messageBox) {
          messageBox.style.display = "block";
          messageBox.innerHTML = `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px; border-radius: 4px; font-size: 13px;">
              <strong>Reset Instructions Generated:</strong> ${res.message}
              ${res.resetToken ? `<div style="margin-top:6px;font-family:monospace;font-size:11px;">Simulation Token: <strong>${res.resetToken}</strong></div>` : ""}
              <div style="margin-top:8px;">You can return to the <a href="./login.html" style="color: #0284c7; font-weight: bold;">Login Page</a>.</div>
            </div>
          `;
        }
        showToast("Password reset instructions sent", "success");
      } catch (err) {
        showToast(err.message || "Could not process reset request.", "danger");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Reset Instructions →";
        }
      }
    });
  }
}

function showError(input, message) {
  input.classList.add("is-invalid");
  let feedback = input.nextElementSibling;
  if (!feedback || !feedback.classList.contains("invalid-feedback")) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.parentNode.appendChild(feedback);
  }
  feedback.textContent = message;
  feedback.style.display = "block";
}

function clearError(input) {
  input.classList.remove("is-invalid");
  const feedback = input.parentNode.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.style.display = "none";
  }
}
