# Portfolio Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `ArnelMalubay.github.io` as a config-driven, AI-safety-forward portfolio that reflects the current resume, archiving the existing site under `legacy/`.

**Architecture:** A single scrolling `index.html` with empty mount points. Seven `data/*.js` files declare plain `const` arrays — the only files the owner edits. `js/render.js` and `js/render-projects.js` turn data into HTML strings; `js/nav.js` and `js/theme.js` handle behavior; `js/main.js` validates and wires everything. `js/validate.js` is shared between the browser and a Node checker so data errors surface as a red/green cycle instead of a blank page.

**Tech Stack:** Vanilla HTML/CSS/JS. No build step, no npm, no dependencies. Google Fonts (Newsreader, Inter, IBM Plex Mono) and Font Awesome via CDN. Node.js used only by `tools/check-data.js`, which requires no packages.

**Spec:** `docs/superpowers/specs/2026-08-04-portfolio-revamp-design.md`

## Global Constraints

- **Never run `git push`.** All commits are local. The owner pushes.
- **No build step.** The site must work opened from `file://` *and* served over HTTP.
- **No npm dependencies.** Nothing that requires `npm install`.
- Data files are **classic scripts** declaring top-level `const` bindings. Never `import`/`export` in `data/*.js` or `js/*.js`.
- Validation **never throws**. Bad data logs and degrades; it never blanks the page.
- No `box-shadow` anywhere. Separation comes from hairline rules and spacing.
- All motion must be disabled under `prefers-reduced-motion: reduce`.
- Contrast floors, both themes: body text ≥ 7:1, interactive/accent text ≥ 4.5:1.
- Anything under `legacy/` is frozen. Never edit it after Task 1.
- Content is authoritative from the spec's Content section. Do not invent resume facts.

### Two refinements to the spec, already decided

1. The spec lists a single `js/render.js`. Projects rendering (categories, chips, grouping, image fallback) is split into `js/render-projects.js` so neither file grows unwieldy. All other sections stay in `js/render.js`.
2. The spec puts the validation pass inside `main.js`. It lives in `js/validate.js` instead, so the same function runs in the browser and under Node via `tools/check-data.js`. This adds no dependency and no build step.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | Semantic shell, `<head>` metadata, empty mount points, script/style load order |
| `data/site.js` | `siteData` — identity, bio, links, resume URL, SEO |
| `data/projects.js` | `projectCategories`, `projectsData` |
| `data/experience.js` | `experienceData` |
| `data/certifications.js` | `certificationsData` |
| `data/education.js` | `educationData` |
| `data/publications.js` | `publicationsData` |
| `data/skills.js` | `skillsData` |
| `js/validate.js` | `validatePortfolioData()` — shared browser/Node data checks |
| `js/render.js` | Shared HTML helpers + every section render except projects |
| `js/render-projects.js` | Project categories, filter chips, cards, image fallback |
| `js/nav.js` | Mobile toggle, smooth scroll, scroll-spy |
| `js/theme.js` | Light/dark toggle with persistence |
| `js/main.js` | Validation + render orchestration |
| `styles/tokens.css` | Custom properties: color (both themes), type scale, spacing |
| `styles/base.css` | Reset, typography, layout primitives, section headers |
| `styles/components.css` | Nav, hero, cards, chips, timeline, lists, footer |
| `tools/check-data.js` | Node runner for `validatePortfolioData()` |
| `README.md` | Schema documentation and copy-paste templates |
| `legacy/` | Frozen archive of the previous site |

---

## Task 1: Archive the current site into `legacy/`

**Files:**
- Move: `index.html`, `script.js`, `styles.css`, `README.md` → `legacy/`
- Copy: `assets/*` → `legacy/assets/` (root `assets/` stays — the new site reuses the images)
- Create: `legacy/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a clean repo root containing only `assets/`, `docs/`, `ref.txt`, and `legacy/`.

- [ ] **Step 1: Move the current site with history intact**

```bash
mkdir -p legacy
git mv index.html legacy/index.html
git mv script.js legacy/script.js
git mv styles.css legacy/styles.css
git mv README.md legacy/README-original.md
mkdir -p legacy/assets
cp assets/* legacy/assets/
git add legacy/assets
```

Note `README.md` is renamed to `README-original.md` so `legacy/README.md` can describe the archive.

- [ ] **Step 2: Verify the archived site still works standalone**

Run: `python -m http.server 8000` then open `http://localhost:8000/legacy/index.html`

Expected: the old site renders exactly as before — 8 project cards with images, blue accent, working nav. Its relative paths (`styles.css`, `script.js`, `assets/*.png`) all resolve inside `legacy/`. If any image 404s, the copy in Step 1 was incomplete.

- [ ] **Step 3: Write the archive notice**

Create `legacy/README.md`:

```markdown
# Legacy Portfolio (archived)

This is the previous version of the portfolio, frozen on 2026-08-04 when the
site was rebuilt. It is kept for reference only — it is not maintained, and
nothing in the current site links to it.

- `index.html`, `styles.css`, `script.js` — the original single-page site
- `assets/` — a copy of the project images (the current site has its own copy at the repo root)
- `README-original.md` — the original repo README

The current site lives at the repo root. See the root `README.md` for how to edit it.
```

- [ ] **Step 4: Verify the repo root is clean**

Run: `ls` at the repo root.

Expected: exactly `assets`, `docs`, `legacy`, `ref.txt`. No `index.html`, `script.js`, or `styles.css` at root — the site is intentionally down between Task 1 and Task 3.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: archive previous portfolio under legacy/"
```

---

## Task 2: Data validation harness and `data/site.js`

**Files:**
- Create: `js/validate.js`, `tools/check-data.js`, `data/site.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `validatePortfolioData(data)` → `{ ok: boolean, issues: Array<{level: "error"|"warning", message: string}>, clean: object }`. `data` is `{ site, categories, projects, experience, certifications, education, publications, skills }`. Any key may be `undefined` — later tasks add them one at a time, and validation must tolerate that by reporting a warning, not crashing. `clean` mirrors the same keys with entries that failed a required-field check removed, per the spec's rule that a bad entry is skipped rather than rendered blank. **Every render call in later tasks reads `clean`, never `data`.**
  - `const siteData` with keys: `name`, `headline`, `location`, `intro`, `about` (string array), `email`, `github`, `linkedin`, `resumeUrl`, `seo` (`{title, description, ogImage, canonical}`).

- [ ] **Step 1: Write the failing check**

Create `tools/check-data.js`:

```js
// Loads every data/*.js file and runs the shared validator.
// Usage: node tools/check-data.js
// Exit code 0 = no errors (warnings allowed), 1 = at least one error.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const DATA_FILES = [
  "site.js",
  "projects.js",
  "experience.js",
  "certifications.js",
  "education.js",
  "publications.js",
  "skills.js",
];

// data/*.js declare top-level `const`s. Lexical declarations do NOT attach to a
// vm sandbox object, so concatenate every file into one script and end with an
// expression that hands the bindings back.
const sources = [];
for (const file of DATA_FILES) {
  const filePath = path.join(ROOT, "data", file);
  if (!fs.existsSync(filePath)) {
    console.log(`skipped data/${file} (not created yet)`);
    continue;
  }
  sources.push(fs.readFileSync(filePath, "utf8"));
}

const collector = `;({
  site: typeof siteData !== "undefined" ? siteData : undefined,
  categories: typeof projectCategories !== "undefined" ? projectCategories : undefined,
  projects: typeof projectsData !== "undefined" ? projectsData : undefined,
  experience: typeof experienceData !== "undefined" ? experienceData : undefined,
  certifications: typeof certificationsData !== "undefined" ? certificationsData : undefined,
  education: typeof educationData !== "undefined" ? educationData : undefined,
  publications: typeof publicationsData !== "undefined" ? publicationsData : undefined,
  skills: typeof skillsData !== "undefined" ? skillsData : undefined,
})`;

let data;
try {
  data = vm.runInNewContext(sources.join("\n;\n") + collector, {}, { filename: "data-bundle.js" });
} catch (error) {
  console.error(`Failed to parse data files: ${error.message}`);
  process.exit(1);
}

const { validatePortfolioData } = require(path.join(ROOT, "js", "validate.js"));
const { ok, issues } = validatePortfolioData(data);

for (const issue of issues) {
  console.log(`${issue.level.toUpperCase()}: ${issue.message}`);
}
console.log(`\n${issues.filter((i) => i.level === "error").length} error(s), ${issues.filter((i) => i.level === "warning").length} warning(s)`);
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `node tools/check-data.js`

Expected: FAIL — `Cannot find module '.../js/validate.js'`.

- [ ] **Step 3: Write the validator**

Create `js/validate.js`:

```js
// Shared data validation. Runs in the browser (js/main.js) and under Node
// (tools/check-data.js). Never throws — bad data degrades, it does not blank
// the page.
function validatePortfolioData(data) {
  const issues = [];
  const error = (message) => issues.push({ level: "error", message });
  const warn = (message) => issues.push({ level: "warning", message });

  const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  // Returns true when every required field is present.
  const requireFields = (label, obj, fields) => {
    let valid = true;
    for (const field of fields) {
      if (isEmpty(obj[field])) {
        error(`${label}: missing required field "${field}"`);
        valid = false;
      }
    }
    return valid;
  };

  // Returns only the entries that passed — a bad entry is skipped, never
  // rendered as a blank card.
  const checkList = (key, list, label, requiredFields) => {
    if (list === undefined) {
      warn(`${key} is not defined yet — its section will be hidden`);
      return [];
    }
    if (!Array.isArray(list)) {
      error(`${key} must be an array, got ${typeof list}`);
      return [];
    }
    if (list.length === 0) {
      warn(`${key} is empty — its section will be hidden`);
      return [];
    }
    return list.filter((entry, index) => {
      const ok = requireFields(`${label} #${index + 1}`, entry, requiredFields);
      if (!ok) warn(`${key}[${index}] was skipped because of the error above`);
      return ok;
    });
  };

  // --- site ---
  let cleanSite;
  if (data.site === undefined) {
    warn("siteData is not defined yet");
  } else {
    const valid = requireFields("siteData", data.site, [
      "name",
      "headline",
      "intro",
      "about",
      "email",
      "github",
      "linkedin",
      "resumeUrl",
      "seo",
    ]);
    if (data.site.seo) {
      requireFields("siteData.seo", data.site.seo, ["title", "description", "canonical"]);
    }
    if (data.site.about && !Array.isArray(data.site.about)) {
      error("siteData.about must be an array of paragraph strings");
    }
    // Site is kept even when incomplete — renderers guard each field, and
    // dropping it would blank the whole page.
    cleanSite = data.site;
    if (!valid) warn("siteData is incomplete — affected parts of the page will be blank");
  }

  // --- projects ---
  const categories =
    data.categories === undefined
      ? []
      : checkList("projectCategories", data.categories, "Category", ["id", "label"]);
  const categoryIds = new Set(categories.map((category) => category.id));

  const projects = checkList("projectsData", data.projects, "Project", [
    "id",
    "title",
    "category",
    "description",
  ]);
  const seenIds = new Set();
  projects.forEach((project, index) => {
    const label = `Project #${index + 1} ("${project.title || "untitled"}")`;
    if (project.id) {
      if (seenIds.has(project.id)) {
        warn(`${label}: duplicate id "${project.id}" — both will render`);
      }
      seenIds.add(project.id);
    }
    if (project.category && categoryIds.size > 0 && !categoryIds.has(project.category)) {
      warn(`${label}: unknown category "${project.category}" — rendering under "Other"`);
    }
    if (project.links !== undefined) {
      if (!Array.isArray(project.links)) {
        error(`${label}: links must be an array`);
      } else {
        project.links.forEach((link, linkIndex) => {
          requireFields(`${label} link #${linkIndex + 1}`, link, ["label", "url"]);
        });
      }
    }
  });

  // --- everything else ---
  const clean = {
    site: cleanSite,
    categories: categories,
    projects: projects,
    experience: checkList("experienceData", data.experience, "Experience", ["company", "role", "start", "bullets"]),
    certifications: checkList("certificationsData", data.certifications, "Certification", ["name", "issuer", "earned"]),
    education: checkList("educationData", data.education, "Education", ["school", "degree", "start", "end"]),
    publications: checkList("publicationsData", data.publications, "Publication", ["title", "venue", "date", "type"]),
    skills: checkList("skillsData", data.skills, "Skill group", ["label", "items"]),
  };

  return { ok: issues.every((issue) => issue.level !== "error"), issues, clean };
}

// Node (tools/check-data.js) only. Browsers ignore this branch.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validatePortfolioData };
}
```

- [ ] **Step 4: Run it — expect warnings, no errors**

Run: `node tools/check-data.js`

Expected: PASS (exit 0) with warnings for every not-yet-created data file, e.g. `WARNING: siteData is not defined yet`. Confirm the exit code: `node tools/check-data.js; echo $?` prints `0`.

- [ ] **Step 5: Write `data/site.js`**

```js
// Identity, bio, contact links, and SEO metadata.
// Edit anything here and refresh the page — no build step.
const siteData = {
  name: "Arnel Malubay",
  headline: "Data scientist working toward technical AI safety research.",
  location: "Pasig City, Philippines",
  intro:
    "I build data and machine learning systems in healthcare analytics, and I spend my research time on technical AI safety — subliminal learning, emergent misalignment, and what persuasion looks like inside a model.",
  about: [
    "I'm a data scientist at Those Who Care, a healthcare analytics company, where I build automations and forecasting models that operators run on daily. Before that I trained computer vision models for phytoplankton species detection as a research fellow at the UP Marine Science Institute, and for scoliosis detection as a research intern at NAIST in Japan.",
    "Since 2026 I've been moving toward technical AI safety research. I completed BlueDot Impact's technical AI safety course and its project course, and the 14-week TARA program built on ARENA. My projects since then have looked at whether subliminal learning survives repeated distillation, at emergent misalignment in a minimal model organism, and at whether persuasion is a linear, language-independent direction inside an LLM.",
    "My background is in computational mathematics — BS Mathematics, summa cum laude, and an MS in Data Science, both from Ateneo de Manila University.",
  ],
  email: "iamarnelmalubay@gmail.com",
  github: "https://github.com/ArnelMalubay",
  linkedin: "https://www.linkedin.com/in/arnel-malubay-7259341aa/",
  resumeUrl: "https://drive.google.com/file/d/1-XCdGrW4yedDTamhgbrTItP6eXYF5TmW/view?usp=sharing",
  seo: {
    title: "Arnel Malubay — Data Scientist & AI Safety Researcher",
    description:
      "Data scientist in healthcare analytics working toward technical AI safety research. Projects on subliminal learning, emergent misalignment, and interpretability.",
    ogImage: "assets/og-image.jpg",
    canonical: "https://arnelmalubay.github.io",
  },
};
```

- [ ] **Step 6: Run the checker again**

Run: `node tools/check-data.js`

Expected: PASS. The `siteData is not defined yet` warning is gone; warnings remain only for the six data files still to come.

- [ ] **Step 7: Prove the validator catches real errors**

Temporarily delete the `email` line from `data/site.js`, then run `node tools/check-data.js`.

Expected: `ERROR: siteData: missing required field "email"`, a follow-up `WARNING: siteData is incomplete …`, and exit code 1. Restore the line and re-run to confirm exit 0.

- [ ] **Step 8: Commit**

```bash
git add js/validate.js tools/check-data.js data/site.js
git commit -m "feat: add shared data validation and site config"
```

---

## Task 3: Page shell, design tokens, and theme toggle

**Files:**
- Create: `index.html`, `styles/tokens.css`, `styles/base.css`, `styles/components.css`, `js/theme.js`, `js/render.js`, `js/main.js`

**Interfaces:**
- Consumes: `siteData`, `validatePortfolioData()`.
- Produces:
  - `escapeHtml(value)` → string, HTML-safe.
  - `mount(elementId, html)` → the element, or `null` if absent.
  - `sectionHeader(number, title)` → HTML string for a numbered section header.
  - `renderHero(site)` → HTML string.
  - `initTheme()` — wires `#theme-toggle`.
  - Mount point ids used by later tasks: `hero`, `about-body`, `skills-list`, `project-filters`, `projects-body`, `experience-list`, `certifications-list`, `education-list`, `publications-list`, `contact-body`, `footer-body`.

- [ ] **Step 1: Write the design tokens**

Create `styles/tokens.css`:

```css
/* Design tokens. Retune the whole site from here. */
:root {
  --bg: #faf9f7;
  --surface: #ffffff;
  --ink: #1a1815;
  --ink-muted: #6b665c;
  --rule: #e3dfd7;
  --accent: #8a2b2b;
  --accent-soft: rgba(138, 43, 43, 0.08);

  /* Category tints, cycled by category index. */
  --tint-1: rgba(138, 43, 43, 0.07);
  --tint-2: rgba(61, 90, 110, 0.07);
  --tint-3: rgba(94, 106, 61, 0.07);
  --tint-4: rgba(120, 88, 46, 0.07);
  --tint-5: rgba(90, 70, 110, 0.07);
  --tint-6: rgba(50, 50, 50, 0.06);

  --font-display: "Newsreader", Georgia, serif;
  --font-body: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace;

  --step--1: 0.8125rem;
  --step-0: 1rem;
  --step-1: 1.1875rem;
  --step-2: 1.5rem;
  --step-3: 2rem;
  --step-4: clamp(2.5rem, 1.8rem + 3vw, 3.75rem);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 5rem;

  --measure: 68ch;
  --page-max: 1120px;
}

:root[data-theme="dark"] {
  --bg: #14130f;
  --surface: #1c1b17;
  --ink: #edeae3;
  --ink-muted: #a8a296;
  --rule: #2e2c26;
  --accent: #e09a8a;
  --accent-soft: rgba(224, 154, 138, 0.1);

  --tint-1: rgba(224, 154, 138, 0.08);
  --tint-2: rgba(138, 178, 204, 0.08);
  --tint-3: rgba(168, 188, 122, 0.08);
  --tint-4: rgba(212, 168, 108, 0.08);
  --tint-5: rgba(168, 148, 204, 0.08);
  --tint-6: rgba(200, 200, 200, 0.06);
}
```

These values were checked against the spec's contrast floors: light ink 16:1, light muted 5.5:1, light accent 8.2:1; dark ink 15.5:1, dark muted 7.3:1, dark accent 8.0:1.

- [ ] **Step 2: Write the base styles**

Create `styles/base.css`:

```css
*,
*::before,
*::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 500;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.01em;
}

p { margin: 0 0 var(--space-4); max-width: var(--measure); }

a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover { text-decoration-thickness: 2px; }

img { max-width: 100%; display: block; }

ul { margin: 0; padding: 0; list-style: none; }

.container {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--space-5);
}

.section { padding: var(--space-8) 0; border-top: 1px solid var(--rule); }

.section-header { margin-bottom: var(--space-6); }

.section-number {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
  display: block;
  margin-bottom: var(--space-3);
}

.section-title { font-size: var(--step-3); }

.meta {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.06em;
  color: var(--ink-muted);
}

.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0);
  white-space: nowrap; border: 0;
}

.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .reveal { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Write nav, hero, and footer components**

Create `styles/components.css`:

```css
/* --- nav --- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
}

.nav-container {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-3) var(--space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.nav-logo { font-family: var(--font-display); font-size: var(--step-1); }

.nav-menu { display: flex; gap: var(--space-5); align-items: center; }

.nav-link {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  text-decoration: none;
}
.nav-link:hover { color: var(--ink); }
.nav-link.is-active { color: var(--accent); }

.nav-actions { display: flex; align-items: center; gap: var(--space-3); }

.theme-toggle {
  background: none;
  border: 1px solid var(--rule);
  color: var(--ink-muted);
  border-radius: 2px;
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--step--1);
}
.theme-toggle:hover { border-color: var(--accent); color: var(--accent); }

.hamburger { display: none; background: none; border: 0; cursor: pointer; padding: var(--space-2); }
.hamburger .bar { display: block; width: 22px; height: 1.5px; background: var(--ink); margin: 4px 0; transition: transform 0.2s ease, opacity 0.2s ease; }
.hamburger.active .bar:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
.hamburger.active .bar:nth-child(2) { opacity: 0; }
.hamburger.active .bar:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

/* --- hero --- */
.hero { padding: var(--space-8) 0 var(--space-7); }
.hero-eyebrow { margin-bottom: var(--space-4); }
.hero-title { font-size: var(--step-4); margin-bottom: var(--space-4); }
.hero-headline { font-size: var(--step-2); font-family: var(--font-display); color: var(--ink); margin-bottom: var(--space-4); max-width: 24ch; }
.hero-intro { font-size: var(--step-1); color: var(--ink-muted); max-width: 60ch; }
.hero-buttons { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border: 1px solid var(--rule);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.06em;
  text-decoration: none;
  color: var(--ink);
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary { background: var(--accent); border-color: var(--accent); color: var(--bg); }
.btn-primary:hover { background: transparent; color: var(--accent); }

/* --- footer --- */
.footer { border-top: 1px solid var(--rule); padding: var(--space-6) 0; }
.footer-inner { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-4); align-items: center; }
.social-links { display: flex; gap: var(--space-4); font-size: var(--step-1); }

/* --- responsive --- */
@media (max-width: 720px) {
  .hamburger { display: block; }
  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    padding: var(--space-5);
    display: none;
  }
  .nav-menu.active { display: flex; }
}
```

- [ ] **Step 4: Write the render helpers and hero**

Create `js/render.js`:

```js
// HTML helpers + section renderers (everything except projects).
function escapeHtml(value) {
  return String(value === undefined || value === null ? "" : value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
  );
}

function mount(elementId, html) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`mount: no element with id "${elementId}"`);
    return null;
  }
  element.innerHTML = html;
  return element;
}

function hideSection(elementId) {
  const element = document.getElementById(elementId);
  const section = element && element.closest(".section");
  if (section) section.hidden = true;
}

function sectionHeader(number, title) {
  return `
    <div class="section-header">
      <span class="section-number">${escapeHtml(number)} — ${escapeHtml(title.toUpperCase())}</span>
      <h2 class="section-title">${escapeHtml(title)}</h2>
    </div>`;
}

function renderHero(site) {
  if (!site) return "";
  return `
    <p class="meta hero-eyebrow">${escapeHtml(site.location || "")}</p>
    <h1 class="hero-title">${escapeHtml(site.name)}</h1>
    <p class="hero-headline">${escapeHtml(site.headline)}</p>
    <p class="hero-intro">${escapeHtml(site.intro)}</p>
    <div class="hero-buttons">
      <a class="btn btn-primary" href="#projects">View Research</a>
      <a class="btn" href="${escapeHtml(site.resumeUrl)}" target="_blank" rel="noopener">
        <i class="fas fa-download" aria-hidden="true"></i> Download Resume
      </a>
      <a class="btn" href="#contact">Get In Touch</a>
    </div>`;
}
```

- [ ] **Step 5: Write the theme toggle**

Create `js/theme.js`:

```js
// Light/dark toggle. The initial value is applied by an inline script in
// <head> before first paint, so there is no flash of the wrong theme.
const THEME_STORAGE_KEY = "portfolio-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const button = document.getElementById("theme-toggle");
  if (button) {
    const isDark = theme === "dark";
    button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    button.innerHTML = isDark
      ? '<i class="fas fa-sun" aria-hidden="true"></i>'
      : '<i class="fas fa-moon" aria-hidden="true"></i>';
  }
}

function initTheme() {
  applyTheme(document.documentElement.getAttribute("data-theme") || "light");
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      console.warn("Theme preference could not be saved:", error.message);
    }
  });
}
```

- [ ] **Step 6: Write the orchestrator**

Create `js/main.js`:

```js
// Validates the data files, then renders every section.
// Sections whose data is missing are hidden rather than rendered empty.
document.addEventListener("DOMContentLoaded", function () {
  const data = {
    site: typeof siteData !== "undefined" ? siteData : undefined,
    categories: typeof projectCategories !== "undefined" ? projectCategories : undefined,
    projects: typeof projectsData !== "undefined" ? projectsData : undefined,
    experience: typeof experienceData !== "undefined" ? experienceData : undefined,
    certifications: typeof certificationsData !== "undefined" ? certificationsData : undefined,
    education: typeof educationData !== "undefined" ? educationData : undefined,
    publications: typeof publicationsData !== "undefined" ? publicationsData : undefined,
    skills: typeof skillsData !== "undefined" ? skillsData : undefined,
  };

  // `clean` drops entries that failed validation, so one bad entry never
  // renders as a blank card. Everything below reads `clean`, never `data`.
  const { issues, clean } = validatePortfolioData(data);
  issues.forEach((issue) => {
    const log = issue.level === "error" ? console.error : console.warn;
    log(`[portfolio data] ${issue.message}`);
  });

  if (clean.site) {
    mount("hero", renderHero(clean.site));
    if (clean.site.seo && clean.site.seo.title) {
      document.title = clean.site.seo.title;
    }
  }

  initTheme();
});
```

- [ ] **Step 7: Write the page shell**

Create `index.html`. Sections beyond the hero are stubbed with empty mount points that later tasks fill — this file is not edited again except to add the `<script>` tags each task introduces.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <script>
    // Theme preflight — runs before first paint to avoid a flash.
    (function () {
      try {
        var stored = localStorage.getItem("portfolio-theme");
        var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
      } catch (error) {
        document.documentElement.setAttribute("data-theme", "light");
      }
    })();
  </script>

  <title>Arnel Malubay — Data Scientist &amp; AI Safety Researcher</title>
  <meta name="description" content="Data scientist in healthcare analytics working toward technical AI safety research. Projects on subliminal learning, emergent misalignment, and interpretability.">
  <meta name="author" content="Arnel Malubay">
  <link rel="canonical" href="https://arnelmalubay.github.io">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

  <link rel="stylesheet" href="styles/tokens.css">
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/components.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">Arnel Malubay</div>
      <ul class="nav-menu" id="nav-menu">
        <li><a class="nav-link" href="#about">About</a></li>
        <li><a class="nav-link" href="#projects">Research</a></li>
        <li><a class="nav-link" href="#experience">Experience</a></li>
        <li><a class="nav-link" href="#certifications">Certifications</a></li>
        <li><a class="nav-link" href="#education">Education</a></li>
        <li><a class="nav-link" href="#contact">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle theme"></button>
        <button class="hamburger" id="hamburger" type="button" aria-label="Toggle navigation" aria-expanded="false">
          <span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </button>
      </div>
    </div>
  </nav>

  <main>
    <header class="hero container" id="hero"></header>

    <section class="section" id="about"><div class="container"><div id="about-body"></div><div id="skills-list"></div></div></section>
    <section class="section" id="projects"><div class="container"><div id="project-filters"></div><div id="projects-body"></div></div></section>
    <section class="section" id="experience"><div class="container"><div id="experience-list"></div></div></section>
    <section class="section" id="certifications"><div class="container"><div id="certifications-list"></div></div></section>
    <section class="section" id="education"><div class="container"><div id="education-list"></div><div id="publications-list"></div></div></section>
    <section class="section" id="contact"><div class="container"><div id="contact-body"></div></div></section>
  </main>

  <footer class="footer"><div class="container"><div id="footer-body"></div></div></footer>

  <script src="data/site.js"></script>
  <script src="js/validate.js"></script>
  <script src="js/render.js"></script>
  <script src="js/theme.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 8: Verify in the browser**

Run: `python -m http.server 8000` then open `http://localhost:8000/`.

Expected, all four:
1. Hero shows the location line in mono, the name in large serif, the headline, the intro, and three buttons.
2. Clicking the theme toggle flips the whole page between paper and near-black; the icon swaps between moon and sun.
3. Reloading keeps the chosen theme with **no flash** of the other one.
4. Console shows warnings only for the six not-yet-created data files — no errors.

Then open `index.html` directly from the file manager (a `file://` URL) and confirm the hero still renders. This is the check that classic scripts are doing their job.

- [ ] **Step 9: Commit**

```bash
git add index.html styles js
git commit -m "feat: add page shell, design tokens, and theme toggle"
```

---

## Task 4: Navigation — mobile toggle, smooth scroll, scroll-spy

**Files:**
- Create: `js/nav.js`
- Modify: `index.html` (add the `<script>` tag), `js/main.js` (call `initNav()`)

**Interfaces:**
- Consumes: the `.nav-link`, `#nav-menu`, `#hamburger` elements from Task 3.
- Produces: `initNav()`, `initReveal()`.

- [ ] **Step 1: Write the navigation module**

Create `js/nav.js`:

```js
// Mobile menu, smooth scrolling, scroll-spy, and scroll reveal.
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initNav() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("active");
      hamburger.classList.toggle("active", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
      if (navMenu) navMenu.classList.remove("active");
      if (hamburger) {
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  });

  initScrollSpy();
}

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const sections = links
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (sections.length === 0) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActive(visible[0].target.id);
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

// Fade-and-rise on scroll. Skipped entirely under reduced motion.
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (prefersReducedMotion()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((item) => observer.observe(item));
}
```

- [ ] **Step 2: Wire it up**

In `index.html`, add before `js/main.js`:

```html
  <script src="js/nav.js"></script>
```

In `js/main.js`, replace the line `  initTheme();` with:

```js
  initTheme();
  initNav();
  initReveal();
```

- [ ] **Step 3: Verify**

Run: `python -m http.server 8000`, open `http://localhost:8000/`.

Expected:
1. Clicking a nav link scrolls smoothly to that section.
2. Scrolling by hand highlights the matching nav link in accent color, and only one at a time.
3. At a 375px-wide viewport the hamburger appears, opens a stacked menu, and closes on link click; `aria-expanded` flips in the inspector.
4. With OS "reduce motion" enabled, jumps are instant and no fade-in occurs.
5. No console errors.

- [ ] **Step 4: Commit**

```bash
git add js/nav.js js/main.js index.html
git commit -m "feat: add navigation, scroll-spy, and reveal animations"
```

---

## Task 5: About and Skills

**Files:**
- Create: `data/skills.js`
- Modify: `js/render.js`, `js/main.js`, `index.html`, `styles/components.css`

**Interfaces:**
- Consumes: `siteData.about`, `escapeHtml`, `mount`, `sectionHeader`.
- Produces: `const skillsData` (array of `{label, items}`), `renderAbout(site)`, `renderSkills(groups)`.

- [ ] **Step 1: Write the skills data**

Create `data/skills.js`:

```js
// Skill groups, rendered in array order. Add, remove, or reorder freely.
const skillsData = [
  { label: "Programming and Scripting", items: ["Python", "JavaScript", "R"] },
  {
    label: "Machine and Deep Learning",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "HuggingFace", "Vertex AI", "Transformers"],
  },
  {
    label: "Mechanistic Interpretability",
    items: ["TransformerLens", "Inspect"],
  },
  {
    label: "Data Visualization",
    items: ["Tableau", "Looker Studio", "Power BI", "Matplotlib", "Seaborn"],
  },
  {
    label: "Database Management",
    items: ["SQL", "PostgreSQL", "BigQuery", "MongoDB", "dbt", "Dataform"],
  },
  { label: "Cloud Computing", items: ["Google Cloud Platform", "Vast.ai"] },
  { label: "DevOps", items: ["Git", "GitHub", "Docker"] },
  {
    label: "Workflow Automation",
    items: ["n8n", "Google Apps Script", "Zapier", "Microsoft Power Automate"],
  },
  { label: "API Development", items: ["FastAPI", "Flask", "Postman"] },
];
```

Mechanistic Interpretability is moved third, immediately after Machine and Deep Learning, because it carries the safety positioning. The resume lists it last.

- [ ] **Step 2: Run the checker**

Run: `node tools/check-data.js`

Expected: PASS, and the `skillsData is not defined yet` warning is gone.

- [ ] **Step 3: Write the renderers**

Append to `js/render.js`:

```js
function renderAbout(site) {
  if (!site || !Array.isArray(site.about)) return "";
  return (
    sectionHeader("01", "About") +
    site.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
  );
}

function renderSkills(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return "";
  const rows = groups
    .map(
      (group) => `
      <div class="skill-group reveal">
        <h3 class="skill-group-label meta">${escapeHtml(group.label)}</h3>
        <ul class="skill-tags">
          ${(group.items || []).map((item) => `<li class="skill-tag">${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");
  return `<h3 class="subsection-title">Technical Skills</h3><div class="skill-groups">${rows}</div>`;
}
```

- [ ] **Step 4: Style them**

Append to `styles/components.css`:

```css
.subsection-title {
  font-size: var(--step-2);
  margin: var(--space-7) 0 var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--rule);
}

.skill-groups { display: grid; gap: var(--space-5); }
@media (min-width: 720px) { .skill-groups { grid-template-columns: repeat(2, 1fr); gap: var(--space-5) var(--space-7); } }

.skill-group-label { display: block; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: var(--space-3); }

.skill-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.skill-tag {
  font-size: var(--step--1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--rule);
  border-radius: 2px;
  color: var(--ink);
}
```

- [ ] **Step 5: Wire it up**

In `index.html`, add `<script src="data/skills.js"></script>` immediately after the `data/site.js` tag.

In `js/main.js`, inside the `if (clean.site)` block, after the `document.title` guard, add:

```js
    mount("about-body", renderAbout(clean.site));
```

And after that block:

```js
  if (clean.skills.length > 0) {
    mount("skills-list", renderSkills(clean.skills));
  } else {
    hideSection("skills-list");
  }
```

- [ ] **Step 6: Verify**

Reload `http://localhost:8000/`.

Expected: an About section headed `01 — ABOUT` with three paragraphs, then "Technical Skills" with nine labelled groups in two columns on desktop and one column below 720px. Tags are bordered, not filled. No console errors.

- [ ] **Step 7: Commit**

```bash
git add data/skills.js js/render.js js/main.js index.html styles/components.css
git commit -m "feat: add about and skills sections"
```

---

## Task 6: Projects data

**Files:**
- Create: `data/projects.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: nothing.
- Produces: `const projectCategories` (`{id, label}[]`) and `const projectsData` with fields `id`, `title`, `category`, `date`, `context`, `description`, `image`, `technologies`, `links` (`{label, url, icon}[]`), `order`.

- [ ] **Step 1: Write the projects config**

Create `data/projects.js`:

```js
// ---------------------------------------------------------------------------
// PROJECTS
//
// To add a project:     copy an entry, edit it, done.
// To remove a project:  delete its entry.
// To reorder:           change `order` (lower renders first, within its category).
// To add a category:    add an entry to projectCategories and use its `id`.
//
// Categories render in the order listed below.
// ---------------------------------------------------------------------------
const projectCategories = [
  { id: "ai-safety", label: "AI Safety Research" },
  { id: "ai-ml", label: "AI & ML Engineering" },
  { id: "data-api", label: "Data & APIs" },
  { id: "math-viz", label: "Math & Visualization" },
];

const projectsData = [
  {
    id: "multi-hop-subliminal",
    title: "Exploring Multi-Hop Subliminal Learning",
    category: "ai-safety",
    date: "Jun 2026 – Jul 2026",
    context: "BlueDot Impact Project Course",
    description:
      "Investigated whether subliminal learning can survive a chain of distillations, and whether mechanistic measures from the literature — such as empirical activation similarity — correlate with trait expression across hops.",
    image: null,
    technologies: ["PyTorch", "Transformers", "Distillation", "LoRA"],
    links: [
      { label: "Repo", url: "https://github.com/ArnelMalubay/multi-hop-subliminal-learning", icon: "fab fa-github" },
      { label: "Write-Up", url: "https://drive.google.com/file/d/13bvkn6Ml28VuCPDnYmG7nfzhKHLcxkjM/view", icon: "fas fa-file-lines" },
    ],
    order: 1,
  },
  {
    id: "tara-subliminal-em",
    title: "Subliminal Emergent Misalignment on a Minimal Model Organism",
    category: "ai-safety",
    date: "May 2026 – Jul 2026",
    context: "Technical Alignment Research Accelerator (TARA)",
    description:
      "Replicated the subliminal emergent misalignment pipeline on a minimal rank-1 LoRA model organism. Submitted to the Reproducibility Track of BlackBoxNLP 2026.",
    image: null,
    technologies: ["PyTorch", "TransformerLens", "LoRA", "Interpretability"],
    links: [
      { label: "Repo", url: "https://github.com/ArnelMalubay/tara-project-subliminal-em", icon: "fab fa-github" },
      { label: "Write-Up", url: "https://drive.google.com/file/d/152SmJsV93zM89aqpCmzVoDoV503iMvSL/view", icon: "fas fa-file-lines" },
    ],
    order: 2,
  },
  {
    id: "persuasion-linear-bilingual",
    title: "We Are Convinced That Persuasion Is Linear And Bilingual In LLMs",
    category: "ai-safety",
    date: "Jun 2026",
    context: "Apart Global South AI Safety Hackathon",
    description:
      "Investigated whether persuasion is a structured internal property of LLMs rather than an artifact of prompt wording, testing both English and Tagalog setups on Gemma-SEA-LION-v4.5.",
    image: null,
    technologies: ["TransformerLens", "Gemma", "Activation Analysis", "Multilingual"],
    links: [
      { label: "Repo", url: "https://github.com/ArnelMalubay/apart-global-south-persuasion-project", icon: "fab fa-github" },
      { label: "Write-Up", url: "https://apartresearch.com/project/we-are-convinced-that-persuasion-is-linear-and-bilingual-in-llms-jrkk", icon: "fas fa-file-lines" },
    ],
    order: 3,
  },
  {
    id: "react-agent",
    title: "ReAct Agentic Chatbot",
    category: "ai-ml",
    description:
      "A ReAct agent with access to document analysis via RAG and web search through Tavily. Serves as a general-purpose chatbot for a range of tasks and queries.",
    image: "assets/chatbot.jpg",
    technologies: ["Python", "LangGraph", "Gradio", "Groq", "Tavily"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/react-agent-ai-assistant", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/react-agent-ai-assistant", icon: "fab fa-github" },
    ],
    order: 1,
  },
  {
    id: "pdf-explainer",
    title: "PDF Explainer using RAG",
    category: "ai-ml",
    description:
      "A Gradio app for uploading PDF documents and asking questions about them using an LLM with retrieval-augmented generation. Built for quick document analysis and information extraction.",
    image: "assets/pdf-explainer.jpg",
    technologies: ["Python", "Gradio", "RAG", "LLM"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/pdf-explainer-using-RAG", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/pdf-explainer-using-rag", icon: "fab fa-github" },
    ],
    order: 2,
  },
  {
    id: "wavelet-cnn",
    title: "Parameter-Efficient CNN Using Wavelet Transforms",
    category: "ai-ml",
    date: "Mar 2024",
    context: "Published in AIP Conference Proceedings",
    description:
      "My senior thesis, incorporating 2D wavelet transforms to build parameter-efficient convolutional neural networks. Published in the American Institute of Physics Conference Proceedings.",
    image: "assets/wavelet-cnn.jpg",
    technologies: ["Python", "Deep Learning", "CNN", "Wavelet Transforms"],
    links: [
      { label: "Read it Here!", url: "https://pubs.aip.org/aip/acp/article-abstract/2895/1/040012/3269703/Parameter-efficient-convolutional-neural-networks?redirectedFrom=fulltext", icon: "fas fa-file-lines" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/Parameter-Efficient-CNN-Using-Wavelet", icon: "fab fa-github" },
    ],
    order: 3,
  },
  {
    id: "scoliosis-transfer-learning",
    title: "Scoliosis Identification via Transfer Learning",
    category: "ai-ml",
    date: "Jan 2022",
    context: "NAIST Research Internship",
    description:
      "Project files and related documents from my internship at the Nara Institute of Science and Technology, where I trained a CNN to detect scoliosis in X-ray images using transfer learning.",
    image: "assets/scoliosis.png",
    technologies: ["Python", "Deep Learning", "CNN", "Transfer Learning", "Computer Vision"],
    links: [
      { label: "Read it Here!", url: "https://drive.google.com/file/d/12361MbVaYKruyu9N6lP3nf-zPwxKKzBT/view?usp=sharing", icon: "fas fa-file-lines" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/NAPI-Internship", icon: "fab fa-github" },
    ],
    order: 4,
  },
  {
    id: "pasig-api",
    title: "Pasig Full Disclosure API",
    category: "data-api",
    description:
      "A free-to-use REST API for Pasig City government transparency documents — resolutions, ordinances, executive orders, and bids and awards. Built with FastAPI and BeautifulSoup.",
    image: "assets/pasig.png",
    technologies: ["Python", "FastAPI", "BeautifulSoup", "Web Scraping"],
    links: [
      { label: "Try it Out!", url: "https://arnel8888-pasig-full-disclosure-api.hf.space/docs#/", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/pasig-full-disclosure-api", icon: "fab fa-github" },
    ],
    order: 1,
  },
  {
    id: "collatz-visualizer",
    title: "Collatz Conjecture Visualizer",
    category: "math-viz",
    description:
      "A Gradio app that visualizes the paths numbers take under the Collatz rule — an interactive exploration of the conjecture with configurable visualizations.",
    image: "assets/collatz-viz.jpg",
    technologies: ["Python", "Gradio", "Mathematics", "Visualization"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/collatz-branches-visualizer", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/collatz-gradio", icon: "fab fa-github" },
    ],
    order: 1,
  },
  {
    id: "julia-set-visualizer",
    title: "Julia Set Visualizer",
    category: "math-viz",
    description:
      "A Gradio app that renders Julia sets, with interactive controls for exploring the fractal parameter space.",
    image: "assets/julia-sets.png",
    technologies: ["Python", "Gradio", "Fractals", "Mathematics"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/julia-set-visualizer", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/julia-visualizer-using-gradio", icon: "fab fa-github" },
    ],
    order: 2,
  },
  {
    id: "cellular-automata-markov",
    title: "Cellular Automata & Markov Chain Simulation",
    category: "math-viz",
    description:
      "A land use change simulation built on cellular automata and Markov chains, applying spatial modelling techniques to forecasting.",
    image: "assets/land-change.png",
    technologies: ["Python", "Cellular Automata", "Markov Chains", "Simulation"],
    links: [
      { label: "Read it Here!", url: "https://drive.google.com/file/d/1jpvSGi6sNMaVF8NIaH6awOTyN5Py1f-F/view?usp=sharing", icon: "fas fa-file-lines" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/Cellular-Automata-And-Markov-Chain-Simulation", icon: "fab fa-github" },
    ],
    order: 3,
  },
];
```

- [ ] **Step 2: Run the checker**

Run: `node tools/check-data.js`

Expected: PASS, no errors, no `unknown category` or `duplicate id` warnings. If a warning names a category, a `category` value has a typo.

- [ ] **Step 3: Prove the unknown-category path works**

Temporarily change `category: "data-api"` on `pasig-api` to `category: "typo"`, run `node tools/check-data.js`.

Expected: `WARNING: Project #8 ("Pasig Full Disclosure API"): unknown category "typo" — rendering under "Other"`, still exit 0. Revert the change.

- [ ] **Step 4: Wire it up**

In `index.html`, add after the `data/skills.js` tag:

```html
  <script src="data/projects.js"></script>
```

- [ ] **Step 5: Verify no regression**

Reload the page. Expected: page renders as before (projects don't render yet — that's Task 7), console shows no `projectsData is not defined` warning, and no errors.

- [ ] **Step 6: Commit**

```bash
git add data/projects.js index.html
git commit -m "feat: add project config with categories and AI safety projects"
```

---

## Task 7: Projects rendering — groups, filter chips, cards

**Files:**
- Create: `js/render-projects.js`
- Modify: `js/main.js`, `index.html`, `styles/components.css`

**Interfaces:**
- Consumes: `projectCategories`, `projectsData`, `escapeHtml`, `mount`, `sectionHeader`.
- Produces: `groupProjects(categories, projects)` → `{id, label, tintIndex, projects}[]`; `renderProjectFilters(groups)`; `renderProjectGroups(groups)`; `initProjectFilters()`.

- [ ] **Step 1: Write the grouping and rendering module**

Create `js/render-projects.js`:

```js
// Projects: grouping by category, filter chips, and card rendering.
const OTHER_CATEGORY = { id: "other", label: "Other" };

// Groups projects under their category, preserving projectCategories order.
// Projects with an unknown category fall into a trailing "Other" group.
function groupProjects(categories, projects) {
  const categoryList = Array.isArray(categories) ? categories : [];
  const projectList = Array.isArray(projects) ? projects : [];
  const knownIds = new Set(categoryList.map((category) => category.id));

  const byOrder = (a, b) => {
    const left = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
    const right = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
    return left - right;
  };

  const groups = categoryList.map((category, index) => ({
    id: category.id,
    label: category.label,
    tintIndex: (index % 6) + 1,
    projects: projectList.filter((project) => project.category === category.id).sort(byOrder),
  }));

  const orphans = projectList.filter((project) => !knownIds.has(project.category)).sort(byOrder);
  if (orphans.length > 0) {
    groups.push({
      id: OTHER_CATEGORY.id,
      label: OTHER_CATEGORY.label,
      tintIndex: 6,
      projects: orphans,
    });
  }

  return groups.filter((group) => group.projects.length > 0);
}

function renderProjectFilters(groups) {
  if (groups.length === 0) return "";
  const total = groups.reduce((sum, group) => sum + group.projects.length, 0);
  const chips = [`<button class="chip is-active" type="button" data-filter="all">All <span class="chip-count">${total}</span></button>`]
    .concat(
      groups.map(
        (group) =>
          `<button class="chip" type="button" data-filter="${escapeHtml(group.id)}">${escapeHtml(group.label)} <span class="chip-count">${group.projects.length}</span></button>`
      )
    )
    .join("");
  return `<div class="chips" role="group" aria-label="Filter projects by category">${chips}</div>`;
}

// Projects without an image get a typographic panel instead — a deliberate
// style, not a placeholder.
function renderProjectMedia(project, tintIndex) {
  if (project.image) {
    return `<div class="project-media"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy"></div>`;
  }
  return `
    <div class="project-media project-media-fallback" style="--tint: var(--tint-${tintIndex});" aria-hidden="true">
      <span class="project-media-text">${escapeHtml(project.title)}</span>
    </div>`;
}

function renderProjectLinks(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  const items = links
    .map(
      (link) =>
        `<a class="project-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">
          ${link.icon ? `<i class="${escapeHtml(link.icon)}" aria-hidden="true"></i>` : ""}
          ${escapeHtml(link.label)}
        </a>`
    )
    .join("");
  return `<div class="project-links">${items}</div>`;
}

function renderProjectCard(project, tintIndex) {
  const metaBits = [project.date, project.context].filter(Boolean).map(escapeHtml);
  const tags = Array.isArray(project.technologies)
    ? project.technologies.map((tech) => `<li class="skill-tag">${escapeHtml(tech)}</li>`).join("")
    : "";
  return `
    <article class="project-card reveal" id="project-${escapeHtml(project.id)}">
      ${renderProjectMedia(project, tintIndex)}
      <div class="project-body">
        ${metaBits.length > 0 ? `<p class="meta project-meta">${metaBits.join(" · ")}</p>` : ""}
        <h4 class="project-title">${escapeHtml(project.title)}</h4>
        <p class="project-description">${escapeHtml(project.description)}</p>
        ${tags ? `<ul class="skill-tags">${tags}</ul>` : ""}
        ${renderProjectLinks(project.links)}
      </div>
    </article>`;
}

function renderProjectGroups(groups) {
  if (groups.length === 0) return "";
  return groups
    .map(
      (group) => `
      <section class="project-group" data-category="${escapeHtml(group.id)}">
        <h3 class="project-group-label meta">${escapeHtml(group.label)}</h3>
        <div class="project-grid">
          ${group.projects.map((project) => renderProjectCard(project, group.tintIndex)).join("")}
        </div>
      </section>`
    )
    .join("");
}

function initProjectFilters() {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const groups = Array.from(document.querySelectorAll(".project-group"));
  if (chips.length === 0 || groups.length === 0) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((other) => other.classList.toggle("is-active", other === chip));
      groups.forEach((group) => {
        group.hidden = filter !== "all" && group.dataset.category !== filter;
      });
    });
  });
}
```

- [ ] **Step 2: Style the projects section**

Append to `styles/components.css`:

```css
.chips { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-7); }

.chip {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.06em;
  background: none;
  border: 1px solid var(--rule);
  border-radius: 2px;
  color: var(--ink-muted);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.chip:hover { border-color: var(--accent); color: var(--accent); }
.chip.is-active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.chip-count { opacity: 0.65; }

.project-group { margin-bottom: var(--space-7); }
.project-group-label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--rule);
  margin-bottom: var(--space-5);
}

.project-grid { display: grid; gap: var(--space-5); }
@media (min-width: 900px) { .project-grid { grid-template-columns: repeat(2, 1fr); } }

.project-card {
  border: 1px solid var(--rule);
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  transition: border-color 0.2s ease;
}
.project-card:hover { border-color: var(--accent); }

.project-media { aspect-ratio: 16 / 9; overflow: hidden; border-bottom: 1px solid var(--rule); }
.project-media img { width: 100%; height: 100%; object-fit: cover; }

.project-media-fallback {
  display: flex;
  align-items: flex-end;
  padding: var(--space-5);
  background: var(--tint, var(--tint-1));
}
.project-media-text {
  font-family: var(--font-mono);
  font-size: var(--step-1);
  line-height: 1.3;
  color: var(--ink);
  max-width: 22ch;
}

.project-body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); flex: 1; }
.project-meta { display: block; }
.project-title { font-size: var(--step-2); }
.project-description { color: var(--ink-muted); margin: 0; }
.project-body .skill-tags { margin-top: auto; }

.project-links { display: flex; flex-wrap: wrap; gap: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--rule); }
.project-link {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.06em;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.project-link:hover { text-decoration: underline; }
```

- [ ] **Step 3: Wire it up**

In `index.html`, add after the `js/render.js` tag:

```html
  <script src="js/render-projects.js"></script>
```

In `js/main.js`, before the `initTheme();` line, add:

```js
  const projectGroups = groupProjects(clean.categories, clean.projects);
  if (projectGroups.length > 0) {
    mount("project-filters", sectionHeader("02", "Research & Projects") + renderProjectFilters(projectGroups));
    mount("projects-body", renderProjectGroups(projectGroups));
    initProjectFilters();
  } else {
    hideSection("projects-body");
  }
```

`initReveal()` must run after this so it observes the new cards — it is already last in `main.js`, so no change is needed there. Confirm the order visually before moving on.

- [ ] **Step 4: Verify**

Reload `http://localhost:8000/`.

Expected:
1. Header reads `02 — RESEARCH & PROJECTS`.
2. Five chips: `All 11`, `AI Safety Research 3`, `AI & ML Engineering 4`, `Data & APIs 1`, `Math & Visualization 3`.
3. Four groups in category order, AI Safety Research first, each with a ruled label.
4. The three AI safety cards show the typographic fallback panel in a warm tint; the other eight show their images.
5. Clicking `AI Safety Research` hides the other three groups; clicking `All` restores them.
6. Cards animate in on scroll, and the border turns accent on hover.
7. No console errors.

- [ ] **Step 5: Prove the config is genuinely editable**

Delete the `julia-set-visualizer` entry from `data/projects.js` and reload.

Expected: 10 projects, `Math & Visualization` count drops to 2, `All` drops to 10, nothing else changes.

Then add a fifth category `{ id: "writing", label: "Writing" }` to `projectCategories` and retag one project to it.

Expected: a new chip and a new group appear with no code changes.

Revert both experiments (`git checkout data/projects.js`) and confirm 11 projects return.

- [ ] **Step 6: Commit**

```bash
git add js/render-projects.js js/main.js index.html styles/components.css
git commit -m "feat: render category-grouped projects with filter chips"
```

---

## Task 8: Experience timeline

**Files:**
- Create: `data/experience.js`
- Modify: `js/render.js`, `js/main.js`, `index.html`, `styles/components.css`

**Interfaces:**
- Consumes: `escapeHtml`, `mount`, `sectionHeader`.
- Produces: `const experienceData` (`{company, role, location, start, end, url, bullets, stack}[]`), `renderExperience(roles)`.

- [ ] **Step 1: Write the experience data**

Create `data/experience.js`:

```js
// Work history, newest first. Rendered in array order.
const experienceData = [
  {
    company: "Those Who Care",
    role: "Data Scientist",
    location: "Miami, Florida, United States (Remote)",
    start: "Feb 2024",
    end: "Present",
    bullets: [
      "Develops automations for healthcare data processing, cutting processing time by more than 80% and saving clients thousands of manual hours annually",
      "Built forecasting models for patient no-show predictions, achieving 95% accuracy and helping increase patient volume by 15%",
      "Conducts client-requested analysis on reimbursement rates, used for million-dollar settlement claims",
    ],
    stack: ["Python", "BigQuery", "Vertex AI", "Apps Script", "Dataform", "Cloud Run", "Cloud Functions", "Tableau", "Looker Studio", "Zapier", "Power Automate", "Postman"],
  },
  {
    company: "University of the Philippines Diliman, Marine Science Institute",
    role: "Research Fellow",
    location: "Quezon City, Philippines",
    start: "Jul 2022",
    end: "Jul 2023",
    bullets: [
      "Created AI models for automated species detection of phytoplankton images, achieving 99% accuracy and helping establish early warning systems for harmful algal blooms",
      "Built data processing workflows for phytoplankton image data, cutting processing time by more than 50%",
    ],
    stack: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "Docker", "Vertex AI", "Google Cloud Platform", "LaTeX"],
  },
  {
    company: "Cirrolytix",
    role: "Data Science Intern",
    location: "Pasig City, Philippines",
    start: "May 2022",
    end: "Sep 2022",
    bullets: [
      "Optimized a series of SQL queries used for data processing of a government website serving thousands of users",
    ],
    stack: ["PostgreSQL", "Git", "HTML", "CSS", "JavaScript", "PHP"],
  },
  {
    company: "Nara Institute of Science and Technology, Computational Systems Biology Laboratory",
    role: "Research Intern",
    location: "Nara, Japan",
    start: "Jan 2022",
    end: "Jan 2022",
    bullets: [
      "Trained AI models for automated scoliosis detection, achieving 99% accuracy and outperforming previous models",
    ],
    stack: ["Python", "PyTorch", "TensorFlow", "Git"],
  },
];
```

- [ ] **Step 2: Run the checker**

Run: `node tools/check-data.js`

Expected: PASS, `experienceData is not defined yet` warning gone.

- [ ] **Step 3: Write the renderer**

Append to `js/render.js`:

```js
function renderExperience(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return "";
  const entries = roles
    .map((role) => {
      const period = role.end && role.end !== role.start ? `${role.start} – ${role.end}` : role.start;
      const bullets = (role.bullets || []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
      const stack = (role.stack || []).map((item) => `<li class="skill-tag">${escapeHtml(item)}</li>`).join("");
      const company = role.url
        ? `<a href="${escapeHtml(role.url)}" target="_blank" rel="noopener">${escapeHtml(role.company)}</a>`
        : escapeHtml(role.company);
      return `
        <article class="entry reveal">
          <p class="meta entry-period">${escapeHtml(period)}</p>
          <div class="entry-body">
            <h3 class="entry-title">${escapeHtml(role.role)}</h3>
            <p class="entry-subtitle">${company}${role.location ? ` · <span class="meta">${escapeHtml(role.location)}</span>` : ""}</p>
            <ul class="entry-bullets">${bullets}</ul>
            ${stack ? `<ul class="skill-tags">${stack}</ul>` : ""}
          </div>
        </article>`;
    })
    .join("");
  return sectionHeader("03", "Experience") + `<div class="entries">${entries}</div>`;
}
```

- [ ] **Step 4: Style the timeline**

Append to `styles/components.css`:

```css
.entries { display: flex; flex-direction: column; }

.entry {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5) 0;
  border-top: 1px solid var(--rule);
}
.entry:first-child { border-top: 0; padding-top: 0; }
@media (min-width: 900px) { .entry { grid-template-columns: 180px 1fr; gap: var(--space-6); } }

.entry-period { padding-top: 0.35rem; }
.entry-body { display: flex; flex-direction: column; gap: var(--space-3); }
.entry-title { font-size: var(--step-2); }
.entry-subtitle { margin: 0; color: var(--ink); }
.entry-bullets { display: flex; flex-direction: column; gap: var(--space-2); color: var(--ink-muted); }
.entry-bullets li { padding-left: var(--space-4); position: relative; max-width: var(--measure); }
.entry-bullets li::before { content: "—"; position: absolute; left: 0; color: var(--accent); }
```

- [ ] **Step 5: Wire it up**

In `index.html`, add `<script src="data/experience.js"></script>` after the `data/projects.js` tag.

In `js/main.js`, after the projects block, add:

```js
  if (clean.experience.length > 0) {
    mount("experience-list", renderExperience(clean.experience));
  } else {
    hideSection("experience-list");
  }
```

- [ ] **Step 6: Verify**

Reload. Expected: `03 — EXPERIENCE` with four roles newest-first; dates in mono in a left column at ≥900px and stacked below that; em-dash bullets in accent; stack tags under each role. NAIST shows `Jan 2022` once, not `Jan 2022 – Jan 2022`. No console errors.

- [ ] **Step 7: Commit**

```bash
git add data/experience.js js/render.js js/main.js index.html styles/components.css
git commit -m "feat: add experience timeline"
```

---

## Task 9: Certifications

**Files:**
- Create: `data/certifications.js`
- Modify: `js/render.js`, `js/main.js`, `index.html`, `styles/components.css`

**Interfaces:**
- Consumes: `escapeHtml`, `mount`, `sectionHeader`.
- Produces: `const certificationsData` (`{name, issuer, earned, expires, credentialUrl, note}[]`), `renderCertifications(items)`.

- [ ] **Step 1: Write the certifications data**

Create `data/certifications.js`:

```js
// Certifications, rendered in array order — AI safety credentials first.
const certificationsData = [
  {
    name: "Technical AI Safety Project Certification",
    issuer: "BlueDot Impact",
    earned: "Jul 2026",
    credentialUrl: "https://bluedot.org/certification?id=recEBoBpj3XVEz2xg",
    note: "Completed a technical AI safety research project under the BlueDot Impact Project Course.",
  },
  {
    name: "TARA Completion Certificate",
    issuer: "Technical Alignment Research Accelerator (TARA)",
    earned: "Jun 2026",
    credentialUrl: "https://drive.google.com/file/d/1E1G1BDzkkss4VSFDoTkfBX7tNO8qOjBM/view?usp=sharing",
    note: "Completed the 14-week TARA program on technical AI safety research, based on ARENA.",
  },
  {
    name: "Technical AI Safety Professional Certification",
    issuer: "BlueDot Impact",
    earned: "Jun 2026",
    credentialUrl: "https://bluedot.org/certification?id=rec2duNvgPdpXFf4c",
    note: "Completed the 5-week BlueDot Impact Technical AI Safety Course.",
  },
  {
    name: "Google Cloud Certified Associate Cloud Engineer",
    issuer: "Google",
    earned: "Feb 2025",
    expires: "Mar 2028",
    credentialUrl: "https://www.credly.com/badges/226f2ce1-3367-46c4-b6f3-f82994e6a121/public_url",
    note: "Associate-level certification covering Compute Engine, Cloud Storage, Cloud Run, GKE, BigQuery, and Cloud Functions.",
  },
];
```

Note the Credly URL is the one from the resume, not the stale one in the archived site.

- [ ] **Step 2: Run the checker**

Run: `node tools/check-data.js` — expect PASS with one fewer warning.

- [ ] **Step 3: Write the renderer**

Append to `js/render.js`:

```js
function renderCertifications(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const entries = items
    .map((item) => {
      const period = item.expires ? `${item.earned} – ${item.expires}` : item.earned;
      const name = item.credentialUrl
        ? `<a href="${escapeHtml(item.credentialUrl)}" target="_blank" rel="noopener">${escapeHtml(item.name)}</a>`
        : escapeHtml(item.name);
      return `
        <article class="entry reveal">
          <p class="meta entry-period">${escapeHtml(period)}</p>
          <div class="entry-body">
            <h3 class="entry-title entry-title-sm">${name}</h3>
            <p class="entry-subtitle meta">${escapeHtml(item.issuer)}</p>
            ${item.note ? `<p class="entry-note">${escapeHtml(item.note)}</p>` : ""}
          </div>
        </article>`;
    })
    .join("");
  return sectionHeader("04", "Certifications") + `<div class="entries">${entries}</div>`;
}
```

- [ ] **Step 4: Add the two shared styles it needs**

Append to `styles/components.css`:

```css
.entry-title-sm { font-size: var(--step-1); }
.entry-note { color: var(--ink-muted); margin: 0; }
```

- [ ] **Step 5: Wire it up**

In `index.html`, add `<script src="data/certifications.js"></script>` after the `data/experience.js` tag.

In `js/main.js`, after the experience block:

```js
  if (clean.certifications.length > 0) {
    mount("certifications-list", renderCertifications(clean.certifications));
  } else {
    hideSection("certifications-list");
  }
```

- [ ] **Step 6: Verify**

Reload. Expected: `04 — CERTIFICATIONS` with four entries, the three AI safety ones first; GCP shows `Feb 2025 – Mar 2028` while the others show a single date; every name is a working link. Click each of the four links and confirm they resolve (BlueDot ×2, Drive, Credly). No console errors.

- [ ] **Step 7: Commit**

```bash
git add data/certifications.js js/render.js js/main.js index.html styles/components.css
git commit -m "feat: add certifications section"
```

---

## Task 10: Education and Publications

**Files:**
- Create: `data/education.js`, `data/publications.js`
- Modify: `js/render.js`, `js/main.js`, `index.html`, `styles/components.css`

**Interfaces:**
- Consumes: `escapeHtml`, `mount`, `sectionHeader`.
- Produces: `const educationData`, `const publicationsData`, `renderEducation(items)`, `renderPublications(items)`.

- [ ] **Step 1: Write both data files**

Create `data/education.js`:

```js
// Degrees, newest first.
const educationData = [
  {
    school: "Ateneo de Manila University",
    degree: "MS Data Science",
    location: "Quezon City, Philippines",
    start: "Aug 2022",
    end: "May 2023",
    note: "18 units of graduate coursework, cumulative QPI 3.92.",
  },
  {
    school: "Ateneo de Manila University",
    degree: "BS Mathematics, minor in Data Science and Analytics",
    location: "Quezon City, Philippines",
    start: "Aug 2018",
    end: "May 2022",
    honors: "Summa Cum Laude · Program Awardee",
    note: "Graduated with a QPI of 3.91.",
  },
];
```

Create `data/publications.js`:

```js
// Papers and talks, newest first. Omit `url` when there is no public link.
const publicationsData = [
  {
    title: "Parameter-efficient convolutional neural networks using wavelet transforms",
    venue: "AIP Conference Proceedings",
    date: "Mar 2024",
    type: "Paper",
    url: "https://pubs.aip.org/aip/acp/article-abstract/2895/1/040012/3269703/Parameter-efficient-convolutional-neural-networks?redirectedFrom=fulltext",
    note: "Main author. Senior thesis on computer vision using CNNs and wavelet transforms.",
  },
  {
    title: "Machine and deep learning approaches to automated classification of Philippine HABs species",
    venue: "International Conference on Harmful Algae",
    date: "Nov 2023",
    type: "Presentation",
    note: "Study exploring AI techniques for phytoplankton species classification.",
  },
];
```

- [ ] **Step 2: Run the checker**

Run: `node tools/check-data.js`

Expected: PASS with **zero warnings and zero errors** — this is the first run with all seven data files present. If any warning remains, a required field is missing.

- [ ] **Step 3: Write both renderers**

Append to `js/render.js`:

```js
function renderEducation(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const entries = items
    .map(
      (item) => `
      <article class="entry reveal">
        <p class="meta entry-period">${escapeHtml(item.start)} – ${escapeHtml(item.end)}</p>
        <div class="entry-body">
          <h3 class="entry-title entry-title-sm">${escapeHtml(item.degree)}</h3>
          <p class="entry-subtitle">${escapeHtml(item.school)}${item.location ? ` · <span class="meta">${escapeHtml(item.location)}</span>` : ""}</p>
          ${item.honors ? `<p class="entry-honors meta">${escapeHtml(item.honors)}</p>` : ""}
          ${item.note ? `<p class="entry-note">${escapeHtml(item.note)}</p>` : ""}
        </div>
      </article>`
    )
    .join("");
  return sectionHeader("05", "Education") + `<div class="entries">${entries}</div>`;
}

function renderPublications(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const entries = items
    .map((item) => {
      const title = item.url
        ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>`
        : escapeHtml(item.title);
      return `
        <article class="entry reveal">
          <p class="meta entry-period">${escapeHtml(item.date)} · ${escapeHtml(item.type)}</p>
          <div class="entry-body">
            <h3 class="entry-title entry-title-sm">${title}</h3>
            <p class="entry-subtitle meta">${escapeHtml(item.venue)}</p>
            ${item.note ? `<p class="entry-note">${escapeHtml(item.note)}</p>` : ""}
          </div>
        </article>`;
    })
    .join("");
  return `<h3 class="subsection-title">Publications & Presentations</h3><div class="entries">${entries}</div>`;
}
```

Publications live under the Education section rather than getting their own number, keeping the section count at six.

- [ ] **Step 4: Style the honors line**

Append to `styles/components.css`:

```css
.entry-honors { color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; }
```

- [ ] **Step 5: Wire it up**

In `index.html`, add after the `data/certifications.js` tag:

```html
  <script src="data/education.js"></script>
  <script src="data/publications.js"></script>
```

In `js/main.js`, after the certifications block:

```js
  if (clean.education.length > 0) {
    mount("education-list", renderEducation(clean.education));
  } else {
    hideSection("education-list");
  }

  if (clean.publications.length > 0) {
    mount("publications-list", renderPublications(clean.publications));
  }
```

- [ ] **Step 6: Verify**

Reload. Expected: `05 — EDUCATION` with two degrees, `SUMMA CUM LAUDE · PROGRAM AWARDEE` in accent uppercase on the BS entry, then a ruled "Publications & Presentations" subsection with two entries. The AIP paper title links out; the ICHA presentation is plain text with no dead link. No console errors, no warnings.

- [ ] **Step 7: Commit**

```bash
git add data/education.js data/publications.js js/render.js js/main.js index.html styles/components.css
git commit -m "feat: add education and publications sections"
```

---

## Task 11: Contact, footer, and social metadata

**Files:**
- Modify: `js/render.js`, `js/main.js`, `index.html`, `styles/components.css`

**Interfaces:**
- Consumes: `siteData`, `escapeHtml`, `mount`, `sectionHeader`.
- Produces: `renderContact(site)`, `renderFooter(site)`.

- [ ] **Step 1: Write the renderers**

Append to `js/render.js`:

```js
function renderContact(site) {
  if (!site) return "";
  const channels = [
    { icon: "fas fa-envelope", label: site.email, url: `mailto:${site.email}` },
    { icon: "fab fa-github", label: "github.com/ArnelMalubay", url: site.github },
    { icon: "fab fa-linkedin", label: "LinkedIn", url: site.linkedin },
    { icon: "fas fa-file-lines", label: "Resume", url: site.resumeUrl },
  ]
    .filter((channel) => channel.url && channel.label)
    .map(
      (channel) => `
      <li>
        <a class="contact-link" href="${escapeHtml(channel.url)}"${String(channel.url).startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>
          <i class="${escapeHtml(channel.icon)}" aria-hidden="true"></i> ${escapeHtml(channel.label)}
        </a>
      </li>`
    )
    .join("");
  return (
    sectionHeader("06", "Contact") +
    `<p class="contact-intro">I'm open to conversations about technical AI safety research, data science roles, and research collaborations. The fastest way to reach me is email.</p>
     <ul class="contact-list">${channels}</ul>`
  );
}

function renderFooter(site) {
  if (!site) return "";
  const year = new Date().getFullYear();
  return `
    <div class="footer-inner">
      <p class="meta">© ${year} ${escapeHtml(site.name)}</p>
      <div class="social-links">
        <a href="${escapeHtml(site.github)}" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github" aria-hidden="true"></i></a>
        <a href="${escapeHtml(site.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin" aria-hidden="true"></i></a>
        <a href="mailto:${escapeHtml(site.email)}" aria-label="Email"><i class="fas fa-envelope" aria-hidden="true"></i></a>
      </div>
    </div>`;
}
```

- [ ] **Step 2: Style it**

Append to `styles/components.css`:

```css
.contact-intro { font-size: var(--step-1); color: var(--ink-muted); max-width: 55ch; }
.contact-list { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-5); }
.contact-link { display: inline-flex; align-items: center; gap: var(--space-3); font-family: var(--font-mono); font-size: var(--step--1); text-decoration: none; }
.contact-link:hover { text-decoration: underline; }
.footer p { margin: 0; }
```

- [ ] **Step 3: Wire it up**

In `js/main.js`, inside the `if (clean.site)` block, after the `renderAbout` line:

```js
    mount("contact-body", renderContact(clean.site));
    mount("footer-body", renderFooter(clean.site));
```

- [ ] **Step 4: Add the social metadata to `<head>`**

In `index.html`, insert after the `<link rel="canonical" ...>` line:

```html
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://arnelmalubay.github.io">
  <meta property="og:title" content="Arnel Malubay — Data Scientist &amp; AI Safety Researcher">
  <meta property="og:description" content="Data scientist in healthcare analytics working toward technical AI safety research. Projects on subliminal learning, emergent misalignment, and interpretability.">
  <meta property="og:image" content="https://arnelmalubay.github.io/assets/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Arnel Malubay — Data Scientist &amp; AI Safety Researcher">
  <meta name="twitter:description" content="Data scientist in healthcare analytics working toward technical AI safety research.">
  <meta name="twitter:image" content="https://arnelmalubay.github.io/assets/og-image.jpg">
  <meta name="theme-color" content="#8a2b2b">
  <meta name="robots" content="index, follow">
```

`assets/og-image.jpg` does not exist yet — this is the known gap recorded in the spec, documented in the README in Task 12. The single shared image replaces the previous two separate (also missing) files.

- [ ] **Step 5: Verify**

Reload. Expected: `06 — CONTACT` with an intro line and four mono links (email, GitHub, LinkedIn, Resume); footer shows the current year and three social icons. Click each and confirm they open correctly, and that the mail link opens a mail client rather than a new tab. No console errors.

- [ ] **Step 6: Commit**

```bash
git add js/render.js js/main.js index.html styles/components.css
git commit -m "feat: add contact section, footer, and social metadata"
```

---

## Task 12: README and full verification pass

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: the owner-facing documentation and a verified site.

- [ ] **Step 1: Write the README**

Create `README.md`:

````markdown
# arnelmalubay.github.io

Personal portfolio. Plain HTML, CSS, and JavaScript — no build step, no
dependencies, no npm. Edit a file, refresh the browser, done.

## Running it locally

Open `index.html` directly, or serve it:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Editing content

**Everything you'll want to change lives in `data/`.** Each file declares one
plain array or object. Nothing else needs to be touched.

| File | Controls |
|---|---|
| `data/site.js` | Your name, headline, bio paragraphs, email, social links, resume URL, SEO text |
| `data/projects.js` | Project categories and every project card |
| `data/experience.js` | Work history |
| `data/certifications.js` | Certifications |
| `data/education.js` | Degrees |
| `data/publications.js` | Papers and talks |
| `data/skills.js` | Skill groups |

After editing, check your data:

```bash
node tools/check-data.js
```

It reports missing fields, unknown project categories, and duplicate ids.
Exit code 0 means no errors. The same checks run in the browser and print to
the console.

### Adding a project

Copy an entry in `data/projects.js` and edit it:

```js
{
  id: "my-project",              // required, unique
  title: "My Project",           // required
  category: "ai-safety",         // required, must match an id in projectCategories
  date: "Aug 2026",              // optional
  context: "Some program",       // optional, small label above the title
  description: "What it does.",  // required
  image: "assets/my-project.png",// optional — omit for a typographic panel
  technologies: ["Python"],      // optional
  links: [                       // optional, any number
    { label: "Repo", url: "https://…", icon: "fab fa-github" },
    { label: "Write-Up", url: "https://…", icon: "fas fa-file-lines" },
  ],
  order: 1,                      // optional — lower renders first within its category
},
```

- **Remove a project:** delete its entry.
- **Reorder:** change `order`. Ordering is per-category.
- **Add a category:** add `{ id: "…", label: "…" }` to `projectCategories`. The
  filter chip, group heading, and background tint all appear automatically.
  Categories render in the order you list them.
- **Icons:** any [Font Awesome 6](https://fontawesome.com/icons) free class.

Other entities work the same way — array order is render order, so move an
entry up to move it up the page.

## Changing the look

`styles/tokens.css` holds every color, font, type size, and spacing value as a
custom property, with a light block and a dark block. Retuning the palette
means editing that one file.

Contrast floors to keep if you change the colors: body text ≥ 7:1 and
interactive text ≥ 4.5:1 against the background, in both themes.

## Structure

```
index.html          page shell and mount points
data/               your content — the only files you normally edit
js/                 render.js, render-projects.js, nav.js, theme.js, main.js, validate.js
styles/             tokens.css, base.css, components.css
assets/             project images
tools/check-data.js data validator (node, no dependencies)
legacy/             the previous version of the site, frozen and unmaintained
```

## Known gap

`assets/og-image.jpg` is referenced by the Open Graph and Twitter tags in
`index.html` but does not exist yet, so link previews show no image. Drop a
1200×630 JPG at that path to fix it — no code change needed.
````

- [ ] **Step 2: Run the full verification checklist**

Run `python -m http.server 8000` and work through every item. Record the actual result of each — do not mark the task done on any unverified item.

1. `node tools/check-data.js` → exit 0, zero warnings, zero errors.
2. Browser console on load → zero errors, zero warnings.
3. All six sections render with content: About, Research & Projects, Experience, Certifications, Education, Contact. Section numbers read 01–06 in order.
4. Project counts: `All 11`, AI Safety Research 3, AI & ML Engineering 4, Data & APIs 1, Math & Visualization 3.
5. Every filter chip shows only its group; `All` restores everything.
6. Theme toggle flips both directions, persists across reload, no flash on load.
7. Layout holds at 375px, 768px, and 1440px — no horizontal scroll at any width, hamburger works below 720px.
8. Scroll-spy highlights exactly one nav link, and the right one, through a full scroll.
9. With OS reduce-motion on, no fades and no smooth scrolling.
10. Every external link resolves: resume, 4 credential links, 11 projects × their links, AIP paper, GitHub, LinkedIn, email.
11. All 8 project images load; the 3 AI safety cards show the typographic fallback.
12. Opening `index.html` from `file://` renders the complete page.

- [ ] **Step 3: Prove the config-driven claim end to end**

Delete the `pasig-api` entry from `data/projects.js` and reload.

Expected: `Data & APIs` chip and group disappear entirely, `All` reads 10.

Add a dummy entry in a brand-new category, reload, and confirm a new chip and group appear with no code change.

Run `git checkout data/projects.js` and reload to confirm 11 projects and 4 categories are back.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README covering content editing and local preview"
```

- [ ] **Step 5: Confirm nothing was pushed**

Run: `git status -sb` and `git log --oneline origin/main..HEAD`

Expected: the branch is ahead of `origin/main` by every commit from Tasks 1–12, and the working tree is clean. **Do not push.** Report the commit list to the owner and stop.

---

## Deferred / out of scope

Per the spec, none of the following are part of this plan:

- Pushing to remote — the owner does that.
- Creating `assets/og-image.jpg`.
- A contact form, analytics, or any backend.
- Project detail pages.
- Editing anything under `legacy/`.
- Self-hosting fonts or replacing Font Awesome.
- Removing `ref.txt` — left in place; the owner can delete it.
