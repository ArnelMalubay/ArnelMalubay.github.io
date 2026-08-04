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
