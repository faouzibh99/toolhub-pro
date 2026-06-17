# ToolHub Pro

A free, fast, privacy-friendly **Word Counter** website with an integrated blog — built with
pure HTML, CSS, and JavaScript. No frameworks. No build tools. No backend. Works on
**GitHub Pages** for free.

---

## 📁 What's Included

```
toolhub-pro/
├── index.html          → Homepage with the Word Counter Pro tool + latest blog posts
├── blog.html           → Blog listing page (grid of all articles)
├── blog-post.html      → Single article template (reads ?post=ID from the URL)
├── about.html          → About page
├── contact.html        → Contact page (demo form — see note below)
├── privacy.html        → Privacy Policy (required for AdSense)
├── terms.html          → Terms of Service (required for AdSense)
├── robots.txt          → Tells search engines to crawl everything
├── sitemap.xml         → List of all pages for Google Search Console
├── css/
│   └── style.css       → All styling (colors, layout, responsive design, dark mode)
├── js/
│   ├── main.js         → Word Counter tool logic + navigation + dark mode + back-to-top
│   ├── blog.js         → Blog engine (loads posts.json, renders lists & single posts)
│   └── adsense.js       → AdSense placeholder slot manager
├── data/
│   └── posts.json      → All 5 blog articles — edit this to add/change posts
└── images/              → (empty — the site uses hotlinked Unsplash images by default)
```

---

## 🚀 Part 1: Deploy to GitHub Pages (Step-by-Step for Beginners)

### Step 1 — Create a GitHub Account
1. Go to **[github.com](https://github.com)** and click **Sign up**.
2. Enter an email, password, and username, then follow the verification steps.
3. Once verified, you'll land on your GitHub dashboard.

### Step 2 — Create a New Repository
1. Click the **+** icon (top-right) → **New repository**.
2. Repository name: `toolhub-pro`
3. Set it to **Public** (required for free GitHub Pages).
4. Do **NOT** check "Add a README" (we already have one).
5. Click **Create repository**.

### Step 3 — Upload Your Files
**Option A — Drag and Drop (easiest):**
1. On your new repository page, click **uploading an existing file**.
2. Open the `toolhub-pro` folder on your computer.
3. Drag **all files and folders** (`index.html`, `css/`, `js/`, `data/`, etc.) into the
   upload box. GitHub preserves folder structure automatically.
4. Scroll down, add a commit message like "Initial upload", and click **Commit changes**.

**Option B — GitHub Desktop (recommended for ongoing edits):**
1. Download [GitHub Desktop](https://desktop.github.com/) and sign in with your account.
2. File → Clone Repository → select `toolhub-pro`.
3. Copy all project files into the cloned folder on your computer.
4. In GitHub Desktop, you'll see all the new files listed. Add a commit summary and click
   **Commit to main**, then **Push origin**.

### Step 4 — Enable GitHub Pages
1. In your repository, click **Settings** (top menu).
2. In the left sidebar, click **Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Branch: select **main**, folder: select **/ (root)**.
5. Click **Save**.

### Step 5 — Get Your Live URL
1. Wait 1–2 minutes, then refresh the **Pages** settings screen.
2. Your site will be live at:
   ```
   https://YOUR-USERNAME.github.io/toolhub-pro/
   ```
3. Visit that URL — your Word Counter Pro site should be live!

---

## 🌐 Part 2: Connect a Custom Domain (Optional)

If you own a domain (e.g., `mytoolhub.com`):

1. In your repo, go to **Settings → Pages → Custom domain**, enter your domain, and save.
   This creates a `CNAME` file in your repo automatically.
2. Go to your domain registrar (Namecheap, GoDaddy, Google Domains, etc.) and add these
   DNS records:
   - **For a root domain** (`mytoolhub.com`): Add four `A` records pointing to:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **For a subdomain** (`www.mytoolhub.com`): Add a `CNAME` record pointing to
     `YOUR-USERNAME.github.io`
3. Wait for DNS to propagate (can take up to 24 hours). Then back in GitHub Pages settings,
   check **Enforce HTTPS** once it becomes available.

---

## 🔍 Part 3: Submit to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** → choose **URL prefix** → enter your full site URL
   (e.g., `https://your-username.github.io/toolhub-pro/`).
3. Verify ownership using the **HTML tag** method:
   - Google gives you a `<meta name="google-site-verification" ...>` tag.
   - Add it inside the `<head>` of `index.html` (and ideally every page), then re-upload.
   - Click **Verify** in Search Console.
4. Once verified, go to **Sitemaps** in the left menu and submit:
   ```
   https://your-username.github.io/toolhub-pro/sitemap.xml
   ```
5. **Important:** Open `sitemap.xml` and `robots.txt` and replace every instance of
   `https://toolhubpro.example.com/` with your real site URL.

---

## 💰 Part 4: Apply for Google AdSense

**Your site must be live (Steps 1–5 above) before applying.**

1. Go to [google.com/adsense](https://www.google.com/adsense) and sign up with your
   Google account.
2. Add your site URL when prompted.
3. Google will give you a snippet like:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
4. Paste this snippet into the `<head>` of **every HTML page** (there's a commented-out
   placeholder already there — just uncomment it and add your `client` ID).
5. Wait for AdSense review (can take a few days to a few weeks). Google checks for:
   - A working, original site with real content ✅ (you have 5 in-depth articles)
   - A Privacy Policy ✅ (`privacy.html`)
   - Terms of Service ✅ (`terms.html`)
   - Easy navigation and a working Contact page ✅
6. **Once approved**, open `js/adsense.js` and follow the comments inside — replace the
   placeholder logic in `reinitAdSlots()` with your real `<ins class="adsbygoogle">` ad
   unit code for each `data-slot` value. Each `.adsense-slot` div already has the correct
   `data-slot` and `data-size` attributes telling you which ad goes where.

---

## 📊 Part 5: Add Google Analytics 4 (GA4)

1. Go to [analytics.google.com](https://analytics.google.com) and create a new GA4
   property for your site.
2. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`).
3. Add this snippet to the `<head>` of every HTML page, just before `</head>`:
   ```html
   <!-- Google Analytics 4 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
4. Replace `G-XXXXXXXXXX` with your real Measurement ID in both places.
5. Re-upload the files to GitHub. Traffic will start appearing in GA4 within a few hours.

---

## ✍️ Part 6: How to Add a New Blog Post

The blog is powered entirely by `data/posts.json`. To add a new article:

1. Open `data/posts.json` in any text editor (or directly on GitHub: click the file →
   pencil/edit icon).
2. Copy one of the existing post objects (the `{ ... }` block including the outer braces
   and trailing comma).
3. Paste it at the **top** of the array (right after the opening `[`), so newer posts
   appear first.
4. Edit these fields for your new post:
   - `id` — a unique, URL-friendly slug (e.g., `"my-new-article"`), lowercase, hyphens only
   - `title` — your article's headline
   - `excerpt` — a 1–2 sentence summary shown on the blog grid
   - `date` — format `"YYYY-MM-DD"`
   - `author` — defaults to `"ToolHub Team"`
   - `category` — used for the badge and "related posts" matching
   - `tags` — an array of relevant keywords
   - `image` — an image URL (Unsplash works great: `https://images.unsplash.com/photo-XXXX?w=800&q=80`)
   - `readTime` — estimated minutes to read (optional — auto-calculated if omitted)
   - `content` — your article body as HTML. Use `<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`,
     `<strong>` tags. Place `[AD1]`, `[AD2]`, `[AD3]` where you want ads to appear
     (after the intro, in the middle, and near the end).
5. Save the file and commit/upload it back to GitHub (or drag-and-drop the updated file
   into your repo).
6. **That's it** — the new post automatically appears on `blog.html`, the homepage's
   "From the Blog" section, and is reachable at
   `blog-post.html?post=your-new-id`. The Table of Contents, related posts, and
   previous/next navigation are all generated automatically from your `<h2>` headings
   and the post's category/date.

> 💡 **Tip:** Validate your JSON before uploading using a free tool like
> [jsonlint.com](https://jsonlint.com) — a single missing comma or bracket will break
> the entire blog.

---

## 🛠️ Customization Notes

- **Colors & fonts:** Edit the CSS variables at the top of `css/style.css` (`:root { ... }`).
- **Site name/logo:** Search and replace `ToolHub<span>Pro</span>` across all HTML files.
- **Contact form:** The form on `contact.html` is currently a client-side demo only (no
  emails are actually sent — there's no backend on a static site). To receive real
  submissions, sign up for a free service like [Formspree](https://formspree.io) or
  [Getform](https://getform.io), and point the form's `action` attribute at the URL they
  give you.
- **Replace placeholder URLs:** Search for `toolhubpro.example.com` across all files
  (meta tags, schema JSON-LD, sitemap, robots.txt) and replace with your real domain or
  GitHub Pages URL for correct SEO and social sharing.
- **Dark mode:** Already implemented — the toggle in the top-right corner saves the
  user's preference in `localStorage`.

---

Enjoy your new site! 🎉
