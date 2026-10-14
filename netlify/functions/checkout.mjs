// POST /api/checkout  { slug }  →  { url }
//
// Creates a Stripe Checkout Session for a single ebook and returns the hosted
// checkout URL. The client only sends a product slug — price, name and
// description are looked up server-side from the shared catalog so they cannot
// be tampered with. Stripe is called via its REST API directly (no SDK, no
// dependencies to install).

import { products } from "../../public/data/products.js";

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions";

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return json(
      { error: "Checkout is not configured yet. Add STRIPE_SECRET_KEY to the site's environment variables." },
      503
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const product = products.find((p) => p.slug === body?.slug);
  if (!product) {
    return json({ error: "Unknown product." }, 404);
  }

  const origin = siteOrigin(request);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/ebooks/${product.slug}?canceled=1`);
  params.set("allow_promotion_codes", "true");
  params.set("metadata[product_slug]", product.slug);
  params.set("line_items[0][quantity]", "1");

  if (product.stripePriceId) {
    params.set("line_items[0][price]", product.stripePriceId);
  } else {
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(product.priceCents));
    params.set("line_items[0][price_data][product_data][name]", product.title);
    params.set("line_items[0][price_data][product_data][description]", product.tagline);
  }

  let stripeResponse;
  try {
    stripeResponse = await fetch(STRIPE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
  } catch (err) {
    console.error("Stripe request failed", err);
    return json({ error: "Could not reach Stripe. Please try again." }, 502);
  }

  const session = await stripeResponse.json();
  if (!stripeResponse.ok || !session.url) {
    console.error("Stripe error", session.error);
    return json({ error: session.error?.message || "Stripe rejected the request." }, 502);
  }

  return json({ url: session.url });
};

export const config = { path: "/api/checkout" };

function siteOrigin(request) {
  // Prefer the real request origin so previews and branch deploys redirect back
  // to themselves; fall back to Netlify's canonical URL.
  try {
    return new URL(request.url).origin;
  } catch {
    return process.env.URL || "http://localhost:8888";
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
