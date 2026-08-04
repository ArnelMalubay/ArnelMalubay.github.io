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
