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
