// Buy buttons → POST /api/checkout → redirect to Stripe Checkout.
//
// Any element with [data-buy="<slug>"] becomes a buy button. The server looks
// up the price from the shared catalog, so nothing sensitive lives here.

import { showToast } from "./site.js";

export function initBuyButtons(root = document) {
  root.addEventListener("click", handleBuyClick);
}

async function handleBuyClick(event) {
  const button = event.target.closest("[data-buy]");
  if (!button || button.disabled) return;

  event.preventDefault();

  const slug = button.dataset.buy;
  const originalLabel = button.innerHTML;
  button.disabled = true;
  button.textContent = "Opening checkout…";

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });

    if (response.status === 404) {
      throw new Error(
        "Checkout isn't available in this static preview. Run `netlify dev` or deploy to Netlify."
      );
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Checkout could not be started. Please try again.");
    }

    window.location.assign(data.url);
  } catch (error) {
    showToast(error.message, { error: true, duration: 7000 });
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
}
