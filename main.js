/* ===================================================
   ToolHub Pro — main.js
   Word Counter Pro tool logic + site-wide UI behaviors
   =================================================== */

/* ---------- Common stop words for keyword density ---------- */
const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","then","else","when","at","by","for",
  "with","about","against","between","into","through","during","before",
  "after","above","below","to","from","up","down","in","out","on","off",
  "over","under","again","further","once","here","there","all","any","both",
  "each","few","more","most","other","some","such","no","nor","not","only",
  "own","same","so","than","too","very","s","t","can","will","just","don",
  "should","now","is","am","are","was","were","be","been","being","have",
  "has","had","having","do","does","did","doing","of","this","that","these",
  "those","i","you","he","she","it","we","they","what","which","who","whom",
  "as","it's","its","my","your","our","their","his","her","them","me","us"
]);

/* =========================================================
   THEME TOGGLE (Dark Mode)
   ========================================================= */
(function initTheme() {
  const saved = localStorage.getItem("toolhub-theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    updateThemeIcon(btn);
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("toolhub-theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("toolhub-theme", "dark");
      }
      updateThemeIcon(btn);
    });
  });
  function updateThemeIcon(btn) {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.textContent = isDark ? "☀️" : "🌙";
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
})();

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("navHamburger");
  const links = document.getElementById("navLinks");
  if (hamburger && links) {
    hamburger.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  // Highlight active nav link
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
});

/* =========================================================
   BACK TO TOP BUTTON
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* =========================================================
   WORD COUNTER PRO TOOL
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("wordInput");
  if (!input) return; // Not on a page with the tool

  const els = {
    words: document.getElementById("statWords"),
    charsWith: document.getElementById("statCharsWith"),
    charsWithout: document.getElementById("statCharsWithout"),
    sentences: document.getElementById("statSentences"),
    paragraphs: document.getElementById("statParagraphs"),
    readingTime: document.getElementById("statReadingTime"),
    speakingTime: document.getElementById("statSpeakingTime"),
    keywordList: document.getElementById("keywordList")
  };

  function analyze() {
    const text = input.value;

    // Words
    const wordMatches = text.trim().length ? text.trim().split(/\s+/) : [];
    const wordCount = wordMatches.length;

    // Characters
    const charsWith = text.length;
    const charsWithout = text.replace(/\s/g, "").length;

    // Sentences (split on . ! ? followed by space or end of string)
    const sentenceMatches = text.trim().length
      ? text.trim().split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 0)
      : [];
    const sentenceCount = sentenceMatches.length;

    // Paragraphs (split on double newline or single newline blocks)
    const paragraphMatches = text.trim().length
      ? text.trim().split(/\n+/).filter(p => p.trim().length > 0)
      : [];
    const paragraphCount = paragraphMatches.length;

    // Reading & speaking time
    const readingMinutes = wordCount / 200;
    const speakingMinutes = wordCount / 130;

    // Update DOM
    els.words.textContent = wordCount.toLocaleString();
    els.charsWith.textContent = charsWith.toLocaleString();
    els.charsWithout.textContent = charsWithout.toLocaleString();
    els.sentences.textContent = sentenceCount.toLocaleString();
    els.paragraphs.textContent = paragraphCount.toLocaleString();
    els.readingTime.textContent = formatTime(readingMinutes);
    els.speakingTime.textContent = formatTime(speakingMinutes);

    renderKeywordDensity(text, wordCount);
  }

  function formatTime(minutes) {
    if (minutes < 1) {
      const seconds = Math.max(1, Math.round(minutes * 60));
      return seconds + " sec";
    }
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) return mins + " min";
    return mins + " min " + secs + " sec";
  }

  function renderKeywordDensity(text, totalWords) {
    if (!els.keywordList) return;

    if (!text.trim()) {
      els.keywordList.innerHTML = '<li class="keyword-list__empty">Start typing to see keyword density...</li>';
      return;
    }

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 1 && !STOP_WORDS.has(w));

    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      els.keywordList.innerHTML = '<li class="keyword-list__empty">No significant keywords yet...</li>';
      return;
    }

    const maxCount = sorted[0][1];

    els.keywordList.innerHTML = sorted.map(([word, count]) => {
      const pct = totalWords > 0 ? ((count / totalWords) * 100).toFixed(1) : "0.0";
      const barWidth = (count / maxCount) * 100;
      return `
        <li>
          <span class="keyword-list__word">${escapeHtml(word)}</span>
          <span class="keyword-list__bar-wrap"><span class="keyword-list__bar" style="width:${barWidth}%"></span></span>
          <span class="keyword-list__count">${count} (${pct}%)</span>
        </li>`;
    }).join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Initial analysis
  analyze();
  input.addEventListener("input", analyze);

  /* ---------- Toolbar Actions ---------- */

  // Copy text
  const copyBtn = document.getElementById("btnCopy");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (!input.value) return;
      navigator.clipboard.writeText(input.value).then(() => {
        flashButton(copyBtn, "Copied!");
      }).catch(() => {
        // Fallback for older browsers
        input.select();
        document.execCommand("copy");
        flashButton(copyBtn, "Copied!");
      });
    });
  }

  // Download as .txt
  const downloadBtn = document.getElementById("btnDownload");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!input.value) return;
      const blob = new Blob([input.value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "toolhub-text.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flashButton(downloadBtn, "Downloaded!");
    });
  }

  // Clear
  const clearBtn = document.getElementById("btnClear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      analyze();
      input.focus();
    });
  }

  // Remove extra spaces
  const removeSpacesBtn = document.getElementById("btnRemoveSpaces");
  if (removeSpacesBtn) {
    removeSpacesBtn.addEventListener("click", () => {
      input.value = input.value
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      analyze();
      flashButton(removeSpacesBtn, "Cleaned!");
    });
  }

  // Case converters
  function bindCaseButton(id, transformFn) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!input.value) return;
      input.value = transformFn(input.value);
      analyze();
    });
  }

  bindCaseButton("btnUppercase", text => text.toUpperCase());
  bindCaseButton("btnLowercase", text => text.toLowerCase());
  bindCaseButton("btnTitleCase", text =>
    text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );
  bindCaseButton("btnSentenceCase", text => {
    const lower = text.toLowerCase();
    return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
  });

  function flashButton(btn, message) {
    const original = btn.textContent;
    btn.textContent = message;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1400);
  }
});

/* =========================================================
   COPY TO CLIPBOARD (Generic - used for share links)
   ========================================================= */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = "✓ Copied!";
      setTimeout(() => { btn.innerHTML = original; }, 1600);
    }
  });
}

/* =========================================================
   CONTACT FORM (Demo - client-side only)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const successMsg = document.getElementById("formSuccess");
    if (successMsg) {
      successMsg.style.display = "block";
      successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    form.reset();
  });
});
