/* ===================================================
   ToolHub Pro — adsense.js
   AdSense slot manager (placeholder mode)

   HOW TO GO LIVE WITH REAL ADS:
   1. Get approved for Google AdSense.
   2. In every HTML file, replace the AdSense script tag in <head>:
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
                crossorigin="anonymous"></script>
   3. Inside each element with class "adsense-slot", replace the
      placeholder <div> content with your real <ins class="adsbygoogle">
      ad unit code from the AdSense dashboard.
   4. Remove or keep this file — it's safe to leave in place since it
      only manages placeholders and logs to the console.
   =================================================== */

/**
 * Processes all .adsense-slot elements currently in the DOM,
 * filling untouched placeholders with a labeled box.
 * Safe to call multiple times (e.g. after dynamic content loads).
 */
function reinitAdSlots() {
  const slots = document.querySelectorAll(".adsense-slot:not([data-processed])");

  slots.forEach(slot => {
    const slotId = slot.dataset.slot || "unnamed-slot";
    const size = slot.dataset.size || "responsive";

    // REPLACE WITH YOUR ADSENSE CODE:
    // Example real implementation:
    //
    // slot.innerHTML = `
    //   <ins class="adsbygoogle"
    //        style="display:block"
    //        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    //        data-ad-slot="${slotId}"
    //        data-ad-format="auto"
    //        data-full-width-responsive="true"></ins>`;
    // (window.adsbygoogle = window.adsbygoogle || []).push({});

    console.log("AdSense slot ready:", slotId, "| size:", size);

    // Placeholder label so beginners can see where ads will appear
    if (!slot.textContent.trim()) {
      slot.textContent = `Ad Slot: ${slotId} (${size})`;
    }
    slot.setAttribute("data-processed", "true");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  reinitAdSlots();
});

/**
 * Injects an AdSense slot after every Nth child in a grid container.
 * Called by blog.js once posts have been rendered.
 */
function injectGridAds(containerEl, every = 3) {
  if (!containerEl) return;
  const cards = Array.from(containerEl.children).filter(el => el.classList.contains("post-card"));

  let insertedCount = 0;
  cards.forEach((card, index) => {
    const position = index + 1;
    if (position % every === 0 && position !== cards.length) {
      insertedCount++;
      const adWrapper = document.createElement("div");
      adWrapper.className = "adsense-slot adsense-slot--grid-ad";
      adWrapper.dataset.slot = `blog-grid-ad-${insertedCount}`;
      adWrapper.dataset.size = "responsive";
      adWrapper.style.gridColumn = "1 / -1";
      adWrapper.textContent = `Ad Slot: blog-grid-ad-${insertedCount} (responsive)`;
      adWrapper.setAttribute("data-processed", "true");
      console.log("AdSense slot ready:", `blog-grid-ad-${insertedCount}`, "| size: responsive");
      card.insertAdjacentElement("afterend", adWrapper);
    }
  });
}
