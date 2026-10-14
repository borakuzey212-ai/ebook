# Orvenio Fitness

Static ebook storefront for fitness training programs. Plain HTML/CSS/JS, no build step,
Stripe Checkout via a single Netlify Function. Built as a portfolio piece.

## Structure

```
public/                      ← everything Netlify serves
  index.html                 ← home: hero, catalog with filters, how it works, FAQ
  product.html               ← product detail (served at /ebooks/<slug> via rewrite)
  success.html               ← Stripe success_url
  404.html
  data/products.js           ← THE catalog: titles, copy, prices. Edit this to change products.
  assets/css/styles.css
  assets/js/                 ← ES modules: site, cover, card, catalog, product, checkout
netlify/functions/checkout.mjs   ← POST /api/checkout → creates a Stripe Checkout Session
netlify.toml                 ← publish dir, rewrites, function bundler
```

## Run locally

Design preview (no Stripe):

```
npx serve public
```

Full preview with the checkout function (needs the Netlify CLI and a Stripe key):

```
export STRIPE_SECRET_KEY=sk_test_...
npx netlify-cli dev
```

Opening `index.html` directly from the file system will not work — the pages use ES modules,
which browsers block on `file://`.

## Deploy to Netlify

1. Push this folder to a Git repository.
2. In Netlify: **Add new site → Import from Git**. Build command: *(leave empty)*. Publish directory: `public`
   (already set in `netlify.toml`).
3. **Site settings → Environment variables** → add `STRIPE_SECRET_KEY` with your Stripe secret key
   (use the `sk_test_…` key for test mode).
4. Deploy. The checkout function is picked up automatically from `netlify/functions/`.

## How checkout works

- A buy button carries `data-buy="<slug>"`.
- `assets/js/checkout.js` POSTs `{ slug }` to `/api/checkout`.
- The function looks the product up in `public/data/products.js`, creates a Checkout Session
  with the price sent inline (`price_data`), and returns the hosted checkout URL.
- The browser redirects to Stripe. Success returns to `/success.html`, cancel returns to the product page.

Prices never come from the client. To use Stripe-managed prices instead, add `stripePriceId: "price_…"`
to a product and the function will use it automatically.

## Not included (by design, for now)

- Fulfilment after payment (webhook + emailing the PDF). The success page says a link is on its way,
  but nothing is sent.
- Real cover images — covers are generated with CSS from the product title.
