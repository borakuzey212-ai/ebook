// Catalog card + "start here" row markup. Shared by the home page and the
// "more programs" strip on product pages.

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

export function renderRow(product, index) {
  return `
    <article class="row">
      ${renderCover(product, { mini: true })}
      <div>
        <div class="row__meta">Start here · 0${index + 1} &nbsp;/&nbsp; ${esc(product.type)} · ${esc(product.level)}</div>
        <h3 class="row__title"><a href="/ebooks/${esc(product.slug)}">${esc(product.title)}</a></h3>
        <p class="row__tagline">${esc(product.tagline)}</p>
      </div>
      <div class="row__end">
        ${priceMarkup(product)}
        ${buyButton(product)}
      </div>
    </article>`;
}
