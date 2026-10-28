/**
 * TradeNest Profile & Settings Page Logic
 * Renders user profile details, linked bank accounts, preferences toggles, and demo reset
 * Integrated with TradeNest Backend Auth API
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { USER_PROFILE } from "../data/mockData.js";
import { authAPI, getStoredUser } from "../utils/api.js";
import { showToast } from "../components/toast.js";

export async function initProfilePage() {
  initTradingNav("dashboard");
  initWatchlist("#watchlist-sidebar");

  renderProfileData();
  attachProfileEvents();

  try {
    const user = await authAPI.getMe();
    if (user) {
      const nameElem = document.getElementById("profile-name");
      const clientElem = document.getElementById("profile-client-id");
      const emailElem = document.getElementById("profile-email");
      const phoneElem = document.getElementById("profile-phone");

      if (nameElem) nameElem.textContent = user.name;
      if (clientElem) clientElem.textContent = user.clientId;
      if (emailElem) emailElem.textContent = user.email;
      if (phoneElem && user.phone) phoneElem.textContent = user.phone;
    }
  } catch (err) {
    // Graceful fallback to cached
  }
}

function renderProfileData() {
  const user = getStoredUser() || USER_PROFILE;

  const nameElem = document.getElementById("profile-name");
  const clientElem = document.getElementById("profile-client-id");
  const emailElem = document.getElementById("profile-email");
  const phoneElem = document.getElementById("profile-phone");

  if (nameElem) nameElem.textContent = user.name || USER_PROFILE.name;
  if (clientElem) clientElem.textContent = user.clientId || USER_PROFILE.clientId;
  if (emailElem) emailElem.textContent = user.email || USER_PROFILE.email;
  if (phoneElem) phoneElem.textContent = user.phone || USER_PROFILE.phone;

  const panElem = document.getElementById("profile-pan");
  const boidElem = document.getElementById("profile-boid");
  const dpidElem = document.getElementById("profile-dpid");
  const bankNameElem = document.getElementById("profile-bank-name");
  const bankAccElem = document.getElementById("profile-bank-acc");
  const ifscElem = document.getElementById("profile-ifsc");

  if (panElem) panElem.textContent = USER_PROFILE.pan;
  if (boidElem) boidElem.textContent = USER_PROFILE.boId;
  if (dpidElem) dpidElem.textContent = USER_PROFILE.dpId;
  if (bankNameElem) bankNameElem.textContent = USER_PROFILE.bankName;
  if (bankAccElem) bankAccElem.textContent = USER_PROFILE.bankAccount;
  if (ifscElem) ifscElem.textContent = USER_PROFILE.ifsc;
}

function attachProfileEvents() {
  const resetBtn = document.getElementById("btn-reset-demo-all");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset local demo data and return to workspace?")) {
        showToast("Demo workspace refreshed!", "success");
        setTimeout(() => {
          window.location.href = "./dashboard.html";
        }, 500);
      }
    });
  }

  const changePassForm = document.getElementById("form-change-password");
  if (changePassForm) {
    changePassForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Simulated password updated successfully!", "success");
      changePassForm.reset();
    });
  }

  const savePrefBtn = document.getElementById("btn-save-prefs");
  if (savePrefBtn) {
    savePrefBtn.addEventListener("click", () => {
      showToast("Workspace preferences saved!", "success");
    });
  }
}
