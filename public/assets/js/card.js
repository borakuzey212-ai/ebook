// Catalog card + index-row markup. Cards are used for "Start here" and the
// "more programs" strip on product pages; index rows build the main catalog.

import { formatPrice } from "/data/products.js";
import { renderCover } from "./cover.js";
import { escapeHtml as esc } from "./site.js";

export function priceMarkup(product, suffix = "USD") {
  const compare = product.compareAtCents
    ? `<s class="price__compare">${formatPrice(product.compareAtCents)}</s>`
    : "";
  return `<div class="price">${compare}${formatPrice(product.priceCents)}<small>${esc(suffix)}</small></div>`;
}

export function buyButton(product, extraClass = "") {
  return `
    <button class="btn btn--primary btn--sm ${extraClass}" type="button" data-buy="${esc(product.slug)}">
      Buy <span class="btn__arrow">→</span>
    </button>`;
}

export function renderCard(product) {
  return `
    <article class="card">
      ${renderCover(product)}
      <div class="card__body">
        <div class="card__meta">
          <span>${esc(product.type)}</span>
          <span>${esc(product.duration)}</span>
        </div>
        <h3 class="card__title"><a href="/ebooks/${esc(product.slug)}">${esc(product.title)}</a></h3>
        <p class="card__tagline">${esc(product.tagline)}</p>
        <div class="card__footer">
          ${priceMarkup(product)}
          ${buyButton(product, "card__buy")}
        </div>
      </div>
    </article>`;
}

export function renderIndexRow(product) {
  return `
    <article class="index-row index-grid">
      <span class="index-row__num">${esc(product.number)}</span>
      ${renderCover(product, { mini: true })}
      <div class="index-row__body">
        <h3 class="index-row__title"><a href="/ebooks/${esc(product.slug)}">${esc(product.title)}</a></h3>
        <p class="index-row__tagline">${esc(product.tagline)}</p>
      </div>
      <div class="index-row__meta">${esc(product.type)}<br>${esc(product.duration)} &middot; ${esc(product.level)}</div>
      ${priceMarkup(product)}
      ${buyButton(product)}
    </article>`;
}
