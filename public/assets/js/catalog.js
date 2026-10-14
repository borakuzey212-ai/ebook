// Home page: hero shelf, "start here" cards, filterable catalog index.

import { products, categories } from "/data/products.js";
import { renderCover } from "./cover.js";
import { renderCard, renderIndexRow } from "./card.js";
import { escapeHtml as esc } from "./site.js";
import { initBuyButtons } from "./checkout.js";

const featured = products.filter((p) => p.featured);

function renderShelf() {
  const shelf = document.getElementById("hero-shelf");
  if (!shelf) return;
  shelf.innerHTML = products
    .map(
      (p) => `
        <a class="shelf__item" href="/ebooks/${esc(p.slug)}" aria-label="${esc(p.title)}">
          ${renderCover(p)}
        </a>`
    )
    .join("");
}

function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  grid.innerHTML = featured.map(renderCard).join("");
}

function initCatalog() {
  const grid = document.getElementById("catalog-list");
  const filters = document.getElementById("filters");
  const count = document.getElementById("catalog-count");
  if (!grid || !filters) return;

  const validIds = categories.map((c) => c.id);
  const requested = new URLSearchParams(window.location.search).get("category");
  let active = validIds.includes(requested) ? requested : "all";

  filters.innerHTML = categories
    .map(
      (c) => `
        <button class="chip${c.id === active ? " is-active" : ""}" type="button" data-category="${c.id}" aria-pressed="${c.id === active}">
          ${esc(c.label)}
        </button>`
    )
    .join("");

  const render = () => {
    const list = active === "all" ? products : products.filter((p) => p.category === active);
    grid.innerHTML = list.length
      ? list.map(renderIndexRow).join("")
      : `<p class="catalog__empty">Nothing in this category yet.</p>`;
    if (count) count.textContent = `${list.length} ${list.length === 1 ? "title" : "titles"}`;
  };

  filters.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    active = chip.dataset.category;
    filters.querySelectorAll(".chip").forEach((el) => {
      const isActive = el === chip;
      el.classList.toggle("is-active", isActive);
      el.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });

  render();
}

function scrollToHashAfterRender() {
  const { hash } = window.location;
  if (!hash) return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  // Everything above the catalog is rendered by JS, so the browser's own
  // fragment jump can land in the wrong place. Re-run it once layout is
  // final — and once more after web fonts settle, since they change heights.
  const jump = () => target.scrollIntoView({ behavior: "instant", block: "start" });
  requestAnimationFrame(jump);
  document.fonts?.ready.then(() => requestAnimationFrame(jump));
}

renderShelf();
renderFeatured();
initCatalog();
initBuyButtons();
scrollToHashAfterRender();
