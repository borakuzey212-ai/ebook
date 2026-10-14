// Product detail page. The slug comes from the URL (/ebooks/<slug> via the
// Netlify rewrite, or ?id=<slug> as a fallback) and everything renders from
// the shared catalog.

import { products, getProduct, formatPrice } from "/data/products.js";
import { renderCover } from "./cover.js";
import { escapeHtml as esc, showToast } from "./site.js";
import { initBuyButtons } from "./checkout.js";
import { renderCard } from "./card.js";

const root = document.getElementById("product-root");
const related = document.getElementById("related-grid");

function slugFromLocation() {
  const match = window.location.pathname.match(/\/ebooks\/([^/?#]+)/);
  if (match) return decodeURIComponent(match[1]);
  return new URLSearchParams(window.location.search).get("id") || "";
}

function renderNotFound() {
  document.title = "Not found — Orvenio Fitness";
  root.innerHTML = `
    <div class="simple">
      <p class="eyebrow eyebrow--lime">404</p>
      <h1 class="display h-xl">No such program.</h1>
      <p class="lead">That link doesn't match anything in the catalog. The programs are all one click away.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="/#programs">Browse programs <span class="btn__arrow">→</span></a>
      </div>
    </div>`;
}

function renderBundleList(product) {
  if (!product.bundleOf?.length) return "";
  const items = product.bundleOf
    .map(getProduct)
    .filter(Boolean)
    .map(
      (p) => `
        <li>
          <a href="/ebooks/${esc(p.slug)}">
            ${renderCover(p, { mini: true })}
            <strong>${esc(p.title)}</strong>
            <span class="price">${formatPrice(p.priceCents)}</span>
          </a>
        </li>`
    )
    .join("");
  return `
    <section class="product__section">
      <h2>Included in this stack</h2>
      <ul class="bundle-list">${items}</ul>
    </section>`;
}

function renderProduct(product) {
  document.title = `${product.title} — Orvenio Fitness`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", product.tagline);

  const price = formatPrice(product.priceCents);
  const compare = product.compareAtCents
    ? `<s class="price__compare">${formatPrice(product.compareAtCents)}</s>`
    : "";

  const specs = [
    ["Level", product.level],
    ["Duration", product.duration],
    ["Frequency", product.frequency],
    ["Equipment", product.equipment],
    ["Length", `${product.pages} pages`],
    ["Format", "PDF · phone, tablet, print"],
  ];

  root.innerHTML = `
    <a class="breadcrumb" href="/#programs">← All programs</a>
    <div class="product">
      <div class="product__visual">${renderCover(product)}</div>
      <div class="product__info">
        <p class="eyebrow eyebrow--lime">${esc(product.type)} · No. ${esc(product.number)}</p>
        <h1 class="display h-l product__title">${esc(product.title)}</h1>
        <p class="product__tagline">${esc(product.tagline)}</p>

        <div class="product__buy">
          <div class="product__price-row">
            <div class="price">${compare}${price}<small>USD · one-time</small></div>
            <span class="eyebrow">PDF · ${esc(product.pages)} pages</span>
          </div>
          <button class="btn btn--primary btn--block" type="button" data-buy="${esc(product.slug)}">
            Buy now — ${price} <span class="btn__arrow">→</span>
          </button>
          <p class="product__note">Secure checkout by Stripe · Download link by email</p>
        </div>

        <dl class="specs">
          ${specs
            .map(
              ([label, value]) => `
                <div class="spec"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`
            )
            .join("")}
        </dl>

        <section class="product__section">
          <h2>About this ${esc(product.type.split(" ")[0].toLowerCase())}</h2>
          ${product.description.map((p) => `<p>${esc(p)}</p>`).join("")}
        </section>

        <section class="product__section">
          <h2>What's inside</h2>
          <ul class="checklist">
            ${product.includes.map((item) => `<li>${esc(item)}</li>`).join("")}
          </ul>
        </section>

        ${renderBundleList(product)}

        <section class="product__section">
          <h2>Who it's for</h2>
          <p>${esc(product.forWho)}</p>
        </section>
      </div>
    </div>`;
}

function renderRelated(product) {
  if (!related) return;
  const sameCategory = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const others = products.filter((p) => p.slug !== product.slug && p.category !== product.category);
  const picks = [...sameCategory, ...others].slice(0, 3);
  related.innerHTML = picks.map(renderCard).join("");
}

const product = getProduct(slugFromLocation());

if (!product) {
  renderNotFound();
  related?.closest("section")?.remove();
} else {
  renderProduct(product);
  renderRelated(product);
}

if (new URLSearchParams(window.location.search).get("canceled")) {
  showToast("Checkout canceled — nothing was charged.");
}

initBuyButtons();
