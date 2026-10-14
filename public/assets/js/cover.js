// Renders a typographic "book cover" for a product. No images involved —
// the look is entirely CSS (see .cover in styles.css). Font sizes scale with
// the cover's own width via container query units.

import { escapeHtml } from "./site.js";

export function renderCover(product, { mini = false } = {}) {
  const classes = ["cover", `cover--${product.cover}`];
  if (mini) classes.push("cover--mini");

  return `
    <div class="${classes.join(" ")}" aria-hidden="true">
      <div class="cover__top">
        <span>Orvenio</span>
        <span>Vol. ${escapeHtml(product.number)}</span>
      </div>
      <div class="cover__body">
        <div class="cover__number">${escapeHtml(product.number)}</div>
        <div class="cover__title">${escapeHtml(product.title)}</div>
        <div class="cover__rule"></div>
      </div>
      <div class="cover__bottom">
        <span>${escapeHtml(product.type)}</span>
        <span>${escapeHtml(product.duration)}</span>
      </div>
    </div>`;
}
