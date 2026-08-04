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

// Hides one mount point and nothing else. Two sections hold two independent
// mounts each (#about has #about-body + #skills-list, #education has
// #education-list + #publications-list), so emptying one data file must not
// take its neighbour down with it.
function hideMount(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.innerHTML = "";
  element.hidden = true;
}

// Hides a whole <section> plus the nav link that points at it, so an empty
// section never leaves a link that highlights nothing and scrolls nowhere.
// main.js decides which sections are empty; this only carries it out.
function hideSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.hidden = true;
  const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
  if (!link) return;
  const item = link.closest("li");
  (item || link).hidden = true;
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

// The header renders even without paragraphs: the About section also holds
// the skills list, which may be all that is left to show.
function renderAbout(site, number) {
  const paragraphs =
    site && Array.isArray(site.about)
      ? site.about.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
      : "";
  return sectionHeader(number, "About") + paragraphs;
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

function renderExperience(roles, number) {
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
  return sectionHeader(number, "Experience") + `<div class="entries">${entries}</div>`;
}

function renderCertifications(items, number) {
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
  return sectionHeader(number, "Certifications") + `<div class="entries">${entries}</div>`;
}

// No section header here: Education and Publications sit in a two-column grid
// and the header belongs above both, so main.js mounts it into
// #education-header instead.
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
  return `<div class="entries">${entries}</div>`;
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

// "https://github.com/octocat/" -> "github.com/octocat", so the handle shown
// on screen always comes from site.github — one place to edit.
function prettyUrl(url) {
  return String(url || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

function renderContact(site, number) {
  if (!site) return "";
  const channels = [
    { icon: "fas fa-envelope", label: site.email, url: site.email ? `mailto:${site.email}` : "" },
    { icon: "fab fa-github", label: prettyUrl(site.github), url: site.github },
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
  // The intro paragraph lives in data/site.js as `contactIntro`. It is
  // optional: an older site.js without it simply renders the links.
  const intro = site.contactIntro
    ? `<p class="contact-intro">${escapeHtml(site.contactIntro)}</p>`
    : "";
  return sectionHeader(number, "Contact") + intro + `<ul class="contact-list">${channels}</ul>`;
}

function renderFooter(site) {
  if (!site) return "";
  const year = new Date().getFullYear();
  // Filtered like renderContact: a missing field used to render <a href="">,
  // which reloads the page when clicked.
  const links = [
    { icon: "fab fa-github", label: "GitHub", url: site.github },
    { icon: "fab fa-linkedin", label: "LinkedIn", url: site.linkedin },
    { icon: "fas fa-envelope", label: "Email", url: site.email ? `mailto:${site.email}` : "" },
  ]
    .filter((link) => link.url)
    .map(
      (link) => `
        <a href="${escapeHtml(link.url)}"${String(link.url).startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'} aria-label="${escapeHtml(link.label)}">
          <i class="${escapeHtml(link.icon)}" aria-hidden="true"></i>
        </a>`
    )
    .join("");
  return `
    <div class="footer-inner">
      <p class="meta">© ${year} ${escapeHtml(site.name)}</p>
      ${links ? `<div class="social-links">${links}</div>` : ""}
    </div>`;
}

// Mirrors site.seo onto the page at load: <title>, the description, the
// canonical link, and the Open Graph / Twitter tags. index.html carries the
// same values statically because link-preview crawlers do not run JavaScript,
// so both places matter — see README.
function applySeo(seo) {
  if (!seo || typeof seo !== "object") return;
  const setContent = (selector, value) => {
    if (!value) return;
    const tag = document.querySelector(selector);
    if (tag) tag.setAttribute("content", value);
  };

  if (seo.title) {
    document.title = seo.title;
    setContent('meta[property="og:title"]', seo.title);
    setContent('meta[name="twitter:title"]', seo.title);
  }
  if (seo.description) {
    setContent('meta[name="description"]', seo.description);
    setContent('meta[property="og:description"]', seo.description);
    setContent('meta[name="twitter:description"]', seo.description);
  }
  if (seo.canonical) {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", seo.canonical);
    setContent('meta[property="og:url"]', seo.canonical);
  }
  if (seo.ogImage) {
    // og:image has to be absolute. A relative path is joined onto canonical
    // rather than document.baseURI, which would be a file:/// path on disk.
    const image = /^https?:\/\//i.test(String(seo.ogImage))
      ? String(seo.ogImage)
      : /^https?:\/\//i.test(String(seo.canonical || ""))
        ? `${String(seo.canonical).replace(/\/+$/, "")}/${String(seo.ogImage).replace(/^\/+/, "")}`
        : String(seo.ogImage);
    setContent('meta[property="og:image"]', image);
    setContent('meta[name="twitter:image"]', image);
  }
}
