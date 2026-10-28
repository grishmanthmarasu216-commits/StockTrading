/**
 * TradeNest Public Header Component
 * Handles active nav link state and responsive mobile hamburger menu
 */

export function initPublicHeader(activePage = "home") {
  const header = document.querySelector(".public-header");
  if (!header) return;

  const toggleBtn = header.querySelector(".mobile-nav-toggle");
  const nav = header.querySelector(".public-nav");

  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      const isExpanded = nav.classList.contains("is-open");
      toggleBtn.setAttribute("aria-expanded", isExpanded);
    });
  }

  // Highlight active link
  const links = header.querySelectorAll(".public-nav a");
  links.forEach(link => {
    if (link.dataset.page === activePage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
