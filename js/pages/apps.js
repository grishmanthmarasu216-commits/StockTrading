/**
 * TradeNest Apps & Ecosystem Tools Page Logic
 * Renders developer API console, basket orders, and GTT planner tools
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { showToast } from "../components/toast.js";

export function initAppsPage() {
  initTradingNav("apps");
  initWatchlist("#watchlist-sidebar");

  attachAppsEvents();
}

function attachAppsEvents() {
  const genKeyBtn = document.getElementById("btn-generate-api-key");
  const apiKeyDisplay = document.getElementById("api-key-display");

  if (genKeyBtn && apiKeyDisplay) {
    genKeyBtn.addEventListener("click", () => {
      const randomKey = "tn_live_" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      apiKeyDisplay.textContent = randomKey;
      showToast("Generated new simulated NestAPI Key!", "success");
    });
  }

  const copyKeyBtn = document.getElementById("btn-copy-api-key");
  if (copyKeyBtn && apiKeyDisplay) {
    copyKeyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(apiKeyDisplay.textContent);
      showToast("API Key copied to clipboard!", "info");
    });
  }

  document.querySelectorAll("[data-app-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const toolName = btn.dataset.appAction;
      showToast(`${toolName} feature is ready for Phase 2 integration`, "info");
    });
  });
}
