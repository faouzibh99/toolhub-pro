/* ===================================================
   ToolHub Pro — blog.js
   Client-side blog engine powered by data/posts.json
   =================================================== */

const POSTS_JSON_PATH = "data/posts.json";

/* Cache posts so we only fetch once per page load */
let _postsCache = null;

async function getAllPosts() {
  if (_postsCache) return _postsCache;
  try {
    const res = await fetch(POSTS_JSON_PATH);
    if (!res.ok) throw new Error("Failed to load posts.json");
    const posts = await res.json();
    // Sort newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    _postsCache = posts;
    return posts;
  } catch (err) {
    console.error("ToolHub Blog Engine error:", err);
    return [];
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function estimateReadTime(post) {
  if (post.readTime) return post.readTime;
  const text = (post.content || "").replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function authorInitials(name) {
  if (!name) return "T";
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* =========================================================
   POST CARD RENDERING
   ========================================================= */
function renderPostCard(post) {
  return `
    <article class="post-card">
      <a href="blog-post.html?post=${encodeURIComponent(post.id)}" class="post-card__image" aria-label="${escapeHtml(post.title)}">
        <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" width="800" height="450">
      </a>
      <div class="post-card__body">
        <span class="post-card__category">${escapeHtml(post.category)}</span>
        <h3 class="post-card__title">
          <a href="blog-post.html?post=${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a>
        </h3>
        <p class="post-card__excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="post-card__meta">
          <span class="post-card__date">${formatDate(post.date)}</span>
          <a href="blog-post.html?post=${encodeURIComponent(post.id)}" class="read-more">Read More</a>
        </div>
      </div>
    </article>`;
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* =========================================================
   SKELETON LOADERS
   ========================================================= */
function renderSkeletonCards(count) {
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-line skeleton-line--short"></div>
          <div class="skeleton skeleton-line skeleton-line--title"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
      </div>`;
  }
  return html;
}

/* =========================================================
   BLOG LISTING PAGE (blog.html)
   ========================================================= */
async function initBlogListPage() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  grid.innerHTML = renderSkeletonCards(6);

  const posts = await getAllPosts();

  if (posts.length === 0) {
    grid.innerHTML = `<p>No posts found. Please check back soon.</p>`;
    return;
  }

  grid.innerHTML = posts.map(renderPostCard).join("");

  // Inject ad slots every 3 cards (handled in adsense.js)
  if (typeof injectGridAds === "function") {
    injectGridAds(grid, 3);
  }
}

/* =========================================================
   HOMEPAGE — LATEST POSTS
   ========================================================= */
async function initLatestPosts(limit = 3) {
  const container = document.getElementById("latestPosts");
  if (!container) return;

  container.innerHTML = renderSkeletonCards(limit);

  const posts = await getAllPosts();
  const latest = posts.slice(0, limit);

  if (latest.length === 0) {
    container.innerHTML = `<p>No posts yet.</p>`;
    return;
  }

  container.innerHTML = latest.map(renderPostCard).join("");
}

/* =========================================================
   SINGLE POST PAGE (blog-post.html)
   ========================================================= */
async function initSinglePostPage() {
  const container = document.getElementById("postContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("post");

  const posts = await getAllPosts();
  const post = posts.find(p => p.id === postId);

  if (!post) {
    renderPostNotFound(container);
    return;
  }

  renderSinglePost(post, posts);
}

function renderPostNotFound(container) {
  container.innerHTML = `
    <div class="post-layout" style="grid-template-columns: 1fr;">
      <div class="post-content" style="text-align:center; padding: 60px 0;">
        <h1 style="font-size:2rem; font-weight:800; margin-bottom:12px;">Post Not Found</h1>
        <p style="color:var(--text-muted); margin-bottom:24px;">
          We couldn't find the article you're looking for. It may have been moved or removed.
        </p>
        <a href="blog.html" class="btn btn-primary">← Back to Blog</a>
      </div>
    </div>`;
  document.title = "Post Not Found — ToolHub Pro";
}

function renderSinglePost(post, allPosts) {
  const container = document.getElementById("postContainer");

  // ----- Process content: replace [AD1]/[AD2]/[AD3] markers with ad slots -----
  let bodyHtml = post.content
    .replace(/\[AD1\]/g, adSlotHtml("article-ad-1"))
    .replace(/\[AD2\]/g, adSlotHtml("article-ad-2"))
    .replace(/\[AD3\]/g, adSlotHtml("article-ad-3"));

  // ----- Generate Table of Contents from H2 tags -----
  const { html: bodyWithIds, toc } = generateTOC(bodyHtml);
  bodyHtml = bodyWithIds;

  // ----- Find related posts (same category, excluding current) -----
  const related = allPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // If not enough related posts in same category, fill with latest others
  if (related.length < 3) {
    const others = allPosts.filter(p => p.id !== post.id && !related.includes(p));
    related.push(...others.slice(0, 3 - related.length));
  }

  // ----- Previous / Next navigation (based on sorted order) -----
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = allPosts[currentIndex + 1] || null; // older
  const nextPost = allPosts[currentIndex - 1] || null; // newer

  const pageUrl = window.location.href.split("?")[0] + "?post=" + encodeURIComponent(post.id);

  container.innerHTML = `
    <div class="post-layout">
      <div class="post-content">

        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a>
          <span class="breadcrumb__sep">/</span>
          <a href="blog.html">Blog</a>
          <span class="breadcrumb__sep">/</span>
          <span>${escapeHtml(post.title)}</span>
        </nav>

        <header class="post-header">
          <span class="post-header__category">${escapeHtml(post.category)}</span>
          <h1>${escapeHtml(post.title)}</h1>
          <div class="post-header__meta">
            <span>👤 ${escapeHtml(post.author)}</span>
            <span>📅 ${formatDate(post.date)}</span>
            <span>⏱️ ${estimateReadTime(post)} min read</span>
          </div>
        </header>

        <div class="post-featured-image">
          <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" width="1200" height="600">
        </div>

        ${toc.length ? renderTOC(toc) : ""}

        <div class="article-body">
          ${bodyHtml}
        </div>

        <div class="tags">
          ${(post.tags || []).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
        </div>

        <div class="share-bar">
          <span class="share-bar__label">Share this article:</span>
          <a class="share-btn share-btn--twitter" target="_blank" rel="noopener noreferrer"
             href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}">𝕏 Twitter</a>
          <a class="share-btn share-btn--facebook" target="_blank" rel="noopener noreferrer"
             href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}">f Facebook</a>
          <a class="share-btn share-btn--linkedin" target="_blank" rel="noopener noreferrer"
             href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}">in LinkedIn</a>
          <button class="share-btn share-btn--copy" onclick="copyToClipboard('${pageUrl}', this)">🔗 Copy Link</button>
        </div>

        <div class="author-box">
          <div class="author-box__avatar">${authorInitials(post.author)}</div>
          <div>
            <div class="author-box__name">${escapeHtml(post.author)}</div>
            <p class="author-box__bio">
              The ToolHub Team writes practical, research-backed guides on writing, SEO, content marketing,
              and productivity — with the goal of helping creators publish better content, faster.
            </p>
          </div>
        </div>

        <nav class="post-nav" aria-label="Post navigation">
          ${prevPost ? `
          <a class="post-nav__item post-nav__item--prev" href="blog-post.html?post=${encodeURIComponent(prevPost.id)}">
            <div class="post-nav__dir">← Previous</div>
            <div class="post-nav__title">${escapeHtml(prevPost.title)}</div>
          </a>` : `<div></div>`}
          ${nextPost ? `
          <a class="post-nav__item post-nav__item--next" href="blog-post.html?post=${encodeURIComponent(nextPost.id)}">
            <div class="post-nav__dir">Next →</div>
            <div class="post-nav__title">${escapeHtml(nextPost.title)}</div>
          </a>` : `<div></div>`}
        </nav>

      </div>

      <aside class="post-sidebar">
        <div class="sticky-sidebar">
          <div class="adsense-slot adsense-slot--sidebar" data-slot="post-sidebar-ad" data-size="300x600"></div>

          <div class="sidebar-widget">
            <h4>Related Articles</h4>
            ${related.map(p => `
              <div class="related-post">
                <img class="related-post__thumb" src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" width="64" height="64">
                <div>
                  <a class="related-post__title" href="blog-post.html?post=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a>
                  <div class="related-post__date">${formatDate(p.date)}</div>
                </div>
              </div>`).join("")}
          </div>

          <div class="sidebar-widget">
            <h4>Try Our Tool</h4>
            <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:14px;">
              Free Word Counter with reading time, keyword density, and more.
            </p>
            <a href="index.html" class="btn btn-primary" style="width:100%; justify-content:center;">Open Word Counter</a>
          </div>
        </div>
      </aside>
    </div>

    <!-- Related Posts (mobile-visible section below article) -->
    <section class="section" style="padding-top:0;">
      <div class="container">
        <h2 class="section__title">Related Posts</h2>
        <p class="section__subtitle">More articles you might find useful</p>
        <div class="blog-grid">
          ${related.map(renderPostCard).join("")}
        </div>
      </div>
    </section>
  `;

  // Update meta tags dynamically
  updatePostMeta(post, pageUrl);

  // Re-run AdSense slot manager for newly inserted .adsense-slot elements
  if (typeof reinitAdSlots === "function") reinitAdSlots();
}

function adSlotHtml(slotId) {
  return `<div class="adsense-slot adsense-slot--leaderboard" data-slot="${slotId}" data-size="responsive"></div>`;
}

/* Generate a Table of Contents from <h2> tags in HTML string */
function generateTOC(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const headings = wrapper.querySelectorAll("h2");
  const toc = [];

  headings.forEach((h, index) => {
    const id = "section-" + (index + 1) + "-" + h.textContent
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 50);
    h.id = id;
    toc.push({ id, text: h.textContent });
  });

  return { html: wrapper.innerHTML, toc };
}

function renderTOC(toc) {
  return `
    <div class="toc">
      <h4>Table of Contents</h4>
      <ol>
        ${toc.map(item => `<li><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`).join("")}
      </ol>
    </div>`;
}

/* Update document title, meta description, OG tags, canonical, and schema for the post */
function updatePostMeta(post, pageUrl) {
  document.title = `${post.title} | ToolHub Pro Blog`;

  setMetaContent('meta[name="description"]', post.excerpt);
  setMetaContent('meta[property="og:title"]', post.title);
  setMetaContent('meta[property="og:description"]', post.excerpt);
  setMetaContent('meta[property="og:image"]', post.image);
  setMetaContent('meta[property="og:url"]', pageUrl);
  setMetaContent('meta[name="twitter:title"]', post.title);
  setMetaContent('meta[name="twitter:description"]', post.excerpt);
  setMetaContent('meta[name="twitter:image"]', post.image);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", pageUrl);

  // Inject Article + BreadcrumbList schema
  const schemaScript = document.createElement("script");
  schemaScript.type = "application/ld+json";
  schemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image,
        "author": { "@type": "Organization", "name": post.author },
        "publisher": {
          "@type": "Organization",
          "name": "ToolHub Pro",
          "logo": { "@type": "ImageObject", "url": "https://toolhubpro.example.com/images/logo.png" }
        },
        "datePublished": post.date,
        "dateModified": post.date,
        "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolhubpro.example.com/index.html" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://toolhubpro.example.com/blog.html" },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": pageUrl }
        ]
      }
    ]
  });
  document.head.appendChild(schemaScript);
}

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", content);
}

/* =========================================================
   INITIALIZE BASED ON PAGE
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initBlogListPage();
  initLatestPosts();
  initSinglePostPage();
});
