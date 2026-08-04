# Portfolio Revamp — Design Spec

**Date:** 2026-08-04
**Repo:** `ArnelMalubay.github.io`
**Status:** Approved for planning

## Goal

Rebuild the portfolio so it reflects the current resume and positions Arnel Malubay as a data
scientist moving into technical AI safety research. All page content moves into per-entity config
files that the owner edits directly — no build step, no framework, no tooling to maintain.

The current site shows 8 projects and nothing else: no work history, no certifications, no
education, no publications, and none of the three AI safety projects. The revamp closes that gap.

## Constraints

1. **No push to remote.** All work is committed locally. The owner pushes when satisfied.
2. **No build step.** The site must work when `index.html` is opened directly from disk and when
   served by GitHub Pages.
3. **Owner-editable.** Adding, removing, and reordering any entity is a single edit to a plain
   JavaScript array, with no code changes.
4. **Existing site preserved.** The current implementation is archived under `legacy/` with git
   history intact.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Positioning | Safety-forward, DS as foundation | Matches how the resume is already tailored |
| Stack | Vanilla HTML/CSS/JS, no build | Zero tooling; owner maintains it alone |
| Data format | Classic scripts declaring `const` arrays | ES modules break `file://` loading |
| Layout | Single scrolling page, sticky nav | One URL, skimmable in one pass |
| Project organization | Category groups + filter chips | Safety work leads; growth without crowding |
| Aesthetic | Research document + dark mode | Distinctive; matches a paper-reading audience |

## Architecture

### File layout

```
/
├── index.html                 # single page, semantic sections, empty mount points
├── data/                      # the only files the owner edits
│   ├── site.js                # siteData
│   ├── projects.js            # projectCategories, projectsData
│   ├── experience.js          # experienceData
│   ├── certifications.js      # certificationsData
│   ├── education.js           # educationData
│   ├── publications.js        # publicationsData
│   └── skills.js              # skillsData
├── js/
│   ├── render.js              # one pure render function per section
│   ├── nav.js                 # mobile toggle, smooth scroll, scroll-spy
│   ├── theme.js               # light/dark toggle, localStorage persistence
│   └── main.js                # validation pass + wiring
├── styles/
│   ├── tokens.css             # custom properties: color (both themes), type, space
│   ├── base.css               # reset, typography, layout primitives
│   └── components.css         # nav, hero, cards, timeline, chips, footer
├── assets/                    # project images (8 existing, reused as-is)
├── legacy/                    # archived copy of the current site
└── README.md                  # schema documentation + copy-paste templates
```

### Module boundaries

- **`data/*.js`** — data only. No logic, no DOM, no dependencies. Each file declares exactly one
  or two top-level `const` arrays/objects.
- **`js/render.js`** — takes a data array and returns an HTML string, or mounts into a container by
  id. Each render function reads only its own data and knows nothing about the others. No global
  state.
- **`js/nav.js`, `js/theme.js`** — self-contained behavior modules. Neither reads portfolio data.
- **`js/main.js`** — the only file that knows about all the others. Validates data, calls render
  functions in order, initializes nav and theme.

Load order in `index.html`: an inline theme-preflight script in `<head>`, then `data/*.js`, then
`js/render.js`, `js/nav.js`, `js/theme.js`, then `js/main.js`.

### Archival

`legacy/` receives the current `index.html`, `script.js`, `styles.css`, and `README.md`, plus a copy
of `assets/`, moved with `git mv` so history follows the files. The 8 project images also remain at
root `assets/` because the new site still uses them. `legacy/index.html` stays reachable at
`/legacy/index.html` as a working archive; a short `legacy/README.md` records that it is frozen
reference material and not maintained. Nothing in the new site links to it.

### Why classic scripts, not ES modules

ES modules are cleaner but require an HTTP origin — browsers block `import` over `file://`. Classic
scripts declaring top-level `const` bindings work in both contexts and keep the editing experience
identical to today's `projectsData` array. The cost is a flat global namespace shared by seven
data files, which is acceptable because each declares one uniquely-named binding.

## Data schemas

### `data/site.js`

```js
const siteData = {
  name: "Arnel Malubay",
  headline: "Data scientist working toward technical AI safety research.",
  location: "Pasig City, Philippines",
  intro: "…",                       // hero paragraph, 1–2 sentences
  about: ["…", "…"],                // About section paragraphs
  email: "iamarnelmalubay@gmail.com",
  github: "https://github.com/ArnelMalubay",
  linkedin: "https://www.linkedin.com/in/arnel-malubay-7259341aa/",
  resumeUrl: "https://drive.google.com/file/d/1-XCdGrW4yedDTamhgbrTItP6eXYF5TmW/view?usp=sharing",
  seo: { title: "…", description: "…", ogImage: "assets/og-image.jpg", canonical: "https://arnelmalubay.github.io" },
};
```

`seo` values are also mirrored statically in the `<head>` so crawlers that ignore JavaScript still
see correct metadata.

### `data/projects.js`

```js
const projectCategories = [
  { id: "ai-safety", label: "AI Safety Research" },
  { id: "ai-ml",     label: "AI & ML Engineering" },
  { id: "data-api",  label: "Data & APIs" },
  { id: "math-viz",  label: "Math & Visualization" },
];

const projectsData = [
  {
    id: "multi-hop-subliminal",     // required, unique, used as DOM id
    title: "…",                     // required
    category: "ai-safety",          // required, must match a category id
    date: "Jun 2026 – Jul 2026",    // optional, free text
    context: "BlueDot Impact Project Course",  // optional, shown as a mono label
    description: "…",               // required
    image: "assets/foo.png",        // optional; null renders a typographic panel
    technologies: ["…"],            // optional
    links: [                        // optional; zero or more
      { label: "Repo", url: "…", icon: "fab fa-github" },
    ],
    order: 1,                       // optional; sorts within category, default = array position
  },
];
```

**Rendering rules.** Categories render as labeled groups in `projectCategories` array order.
Projects sort by ascending `order` within their category; entries without `order` fall to the end in
array order. A `category` matching no known id renders under an "Other" group and logs a console
warning. Filter chips render as `All` plus one chip per non-empty category with a count; filtering
is client-side show/hide with no URL state.

**Image fallback.** When `image` is null or missing, the card renders a typographic panel: the
project title in mono over a background tint keyed to its category. This is a deliberate style, not
a placeholder — the three AI safety projects ship this way and images can be added later without
code changes.

### Other entities

```js
const experienceData = [{ company, role, location, start, end, url?, bullets: [], stack: [] }];
const certificationsData = [{ name, issuer, earned, expires?, credentialUrl, note? }];
const educationData = [{ school, degree, location, start, end, honors?, note? }];
const publicationsData = [{ title, venue, date, type, url?, note? }];
const skillsData = [{ label: "Programming and Scripting", items: ["Python", "JavaScript", "R"] }];
```

Ordering for all of these is array order — top of the array renders first. `experienceData` and
`educationData` are authored newest-first; `certificationsData` is authored with the three AI safety
credentials before the cloud credential.

## Content

All content comes from the resume at the Drive link in `ref.txt`, cross-checked against the GitHub
profile.

### Experience (4 roles)

1. **Those Who Care** — Data Scientist, Miami FL (Remote), Feb 2024 – Present. Healthcare data
   automations (>80% processing time cut), patient no-show forecasting (95% accuracy, +15% patient
   volume), reimbursement-rate analysis for million-dollar settlement claims.
2. **UP Diliman, Marine Science Institute** — Research Fellow, Quezon City, Jul 2022 – Jul 2023.
   Phytoplankton species detection models (99% accuracy) for harmful-algal-bloom early warning;
   image processing workflows (>50% time cut).
3. **Cirrolytix** — Data Science Intern, Pasig City, May 2022 – Sep 2022. SQL query optimization for
   a government website.
4. **NAIST, Computational Systems Biology Laboratory** — Research Intern, Nara, Japan, Jan 2022.
   Automated scoliosis detection models (99% accuracy).

### Certifications (4, safety-first order)

1. Technical AI Safety Project Certification — BlueDot Impact, Jul 2026
2. TARA Completion Certificate — Technical Alignment Research Accelerator, Jun 2026
3. Technical AI Safety Professional Certification — BlueDot Impact, Jun 2026
4. Google Cloud Certified Associate Cloud Engineer — Google, Feb 2025 – Mar 2028

**Correction:** the Credly URL on the current site (`7e8ee43d-7734-4e4a-9234-3b40d8c985d6`) does not
match the resume (`226f2ce1-3367-46c4-b6f3-f82994e6a121`). The resume's URL is authoritative.

### Education

- MS Data Science, Ateneo de Manila University, Aug 2022 – May 2023. 18 units, QPI 3.92.
- BS Mathematics minor in Data Science and Analytics, Ateneo de Manila University, Aug 2018 –
  May 2022. Summa Cum Laude, Program Awardee, QPI 3.91.

### Publications and presentations

- *Parameter-efficient convolutional neural networks using wavelet transforms* — AIP Conference
  Proceedings, Mar 2024. Main author.
- *Machine and deep learning approaches to automated classification of Philippine HABs Species* —
  International Conference on Harmful Algae, Nov 2023. Presentation, no public link.

### Projects (11)

New AI safety projects, each carrying a Repo link and a Write-Up link:

1. **Exploring Multi-Hop Subliminal Learning** (BlueDot Impact Project Course, Jun–Jul 2026)
2. **Subliminal Emergent Misalignment on a Minimal Model Organism** (TARA, May–Jul 2026; submitted
   to the Reproducibility Track of BlackBoxNLP 2026)
3. **We Are Convinced That Persuasion Is Linear And Bilingual In LLMs** (Apart Global South AI
   Safety Hackathon, Jun 2026)

Existing 8 projects carry over with descriptions and images intact, recategorized:

| Project | Category |
|---|---|
| PDF Explainer using RAG | `ai-ml` |
| ReAct Agentic Chatbot | `ai-ml` |
| Parameter-Efficient CNN Using Wavelet Transforms | `ai-ml` |
| Scoliosis Identification via Transfer Learning | `ai-ml` |
| Pasig Full Disclosure API | `data-api` |
| Collatz Conjecture Visualizer | `math-viz` |
| Julia Set Visualizer | `math-viz` |
| Cellular Automata & Markov Chain Simulation | `math-viz` |

Their existing `redirectUrl` + `githubUrl` pairs convert to `links` arrays preserving the current
button labels ("Try it Out!", "Read it Here!") as link labels.

### Skills (9 groups, from the resume)

Programming and Scripting; Machine and Deep Learning; Data Visualization; Database Management;
Cloud Computing; DevOps; Workflow Automation; API Development; Mechanistic Interpretability.

## Page structure

| # | Section | Content |
|---|---|---|
| — | Nav | Name, section links, theme toggle, mobile hamburger, scroll-spy |
| — | Hero | Name, positioning headline, intro paragraph, CTAs: View Research / Download Resume / Get In Touch |
| 01 | About & Skills | Two paragraphs + nine grouped skill lists |
| 02 | Research & Projects | Filter chips + category-grouped project cards |
| 03 | Experience | Ruled timeline, 4 roles with bullets and stack |
| 04 | Certifications | 4 entries with issuer, date, credential link |
| 05 | Education & Publications | Two ruled lists, side by side ≥900px |
| 06 | Contact | Email, GitHub, LinkedIn, resume |
| — | Footer | Copyright with dynamic year, social icons |

The hero and footer carry no numbered header; numbering runs 01–06 across the six content sections.
Projects sits above Experience: the safety work is the argument the page is making.

## Visual system

**Typography.** Newsreader (headings), Inter (body), IBM Plex Mono (section numbers, dates,
metadata labels, category tags) — loaded from Google Fonts, consistent with the current site's use
of a font CDN. Font Awesome is retained for link and social icons.

**Color.** Defined as custom properties in `tokens.css`, one block per theme.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FAF9F7` | `#14130F` |
| `--surface` | `#FFFFFF` | `#1C1B17` |
| `--ink` | `#1A1815` | `#EDEAE3` |
| `--ink-muted` | `#6B665C` | `#A8A296` |
| `--rule` | `#E3DFD7` | `#2E2C26` |
| `--accent` | oxblood, ~`#8A2B2B` | lifted tint, ~`#E09A8A` |

Exact accent values are tuned during implementation against contrast targets: body text ≥ 7:1
against `--bg`, accent links and all interactive text ≥ 4.5:1, in both themes.

**Form.** No box shadows anywhere — separation comes from hairline rules and spacing. Cards are
bordered entries whose border shifts to accent on hover. Section headers are numbered in mono
(`02 — RESEARCH`). Everything left-aligned on a strong text column with generous vertical rhythm.

**Theme toggle.** `theme.js` reads `localStorage`, falling back to `prefers-color-scheme` on first
visit, and sets `data-theme` on `<html>`. An inline script in `<head>` applies the stored value
before first paint so there is no flash of the wrong theme.

**Responsive.** Single column below 720px; project grid goes two-column at ≥900px; Education and
Publications sit side by side at ≥900px. Nav collapses to the existing hamburger pattern below
720px.

**Motion.** Fade-and-rise on scroll via `IntersectionObserver`, entirely disabled under
`prefers-reduced-motion: reduce`.

## Error handling

`main.js` runs a validation pass before rendering and reports through `console.warn` — never by
throwing, so one bad entry can never blank the page:

- Missing required field on any entity → warn naming the file, index, and field; skip that entry.
- `project.category` matching no known category id → warn; render under "Other".
- Duplicate `project.id` → warn; render both.
- Empty data array → warn; hide that section's heading rather than render an empty shell.
- Missing image file → browser-native alt text; the typographic fallback covers the `null` case, not
  the broken-path case.

## Verification

No test framework is added — this is a static site with no logic worth a test harness. Verification
is a manual checklist, run and reported against before the work is called done:

1. Every section renders from its data file, with all resume content present and correct.
2. Filter chips work for every category, including `All`; counts are accurate.
3. Deleting one project and adding a dummy project both work with no code changes — proving the
   config-driven claim rather than asserting it. Reverted afterward.
4. Theme toggle switches both ways, persists across reload, and shows no flash on load.
5. Layout holds at 375px, 768px, and 1440px.
6. Scroll-spy highlights the correct nav item through a full scroll.
7. Every external link resolves (resume, credentials, repos, write-ups, publications).
8. The page works both from `file://` and from `python -m http.server`.
9. Console is free of errors and of unexpected validation warnings.

## Known gaps

The current site's Open Graph and Twitter tags point at `assets/og-image.jpg` and
`assets/twitter-image.jpg`, neither of which exists in the repo — link previews are broken today.
The revamp keeps a single `seo.ogImage` field pointing at `assets/og-image.jpg` and notes the
missing file in the README. Producing the image is left to the owner; the site is otherwise correct
without it.

## Out of scope

- Pushing to remote. All commits stay local.
- A contact form, analytics, or any backend.
- Project detail pages — links point at existing repos and write-ups.
- Rewriting or restyling anything under `legacy/`.
- Replacing Font Awesome or self-hosting fonts.
- New project images. The typographic fallback covers projects without one.
