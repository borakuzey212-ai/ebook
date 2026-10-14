// Shared helpers + small site-wide behaviours (mobile nav, footer year, toast).
// Imported by every page; no globals are created.

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

let toastTimer = null;

export function showToast(message, { error = false, duration = 5000 } = {}) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.toggle("toast--error", error);

  // Force a reflow so the transition replays when a toast is already visible.
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  // Close after choosing a link, and on Escape.
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function initFooterYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });
}

function enableSmoothScroll() {
  // Switched on after load so the browser's own jump to #fragment stays
  // instant; only in-page anchor clicks after that animate. (Not rAF-based:
  // rAF never fires in a background tab.)
  const enable = () => setTimeout(() => document.documentElement.classList.add("is-ready"), 0);
  if (document.readyState === "complete") enable();
  else window.addEventListener("load", enable, { once: true });
}

initMobileNav();
initFooterYear();
enableSmoothScroll();
