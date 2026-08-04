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
