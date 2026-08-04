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
  // aria-pressed carries the active state for screen readers; the is-active
  // class only carries it visually. initProjectFilters keeps both in sync.
  const chips = [
    `<button class="chip is-active" type="button" data-filter="all" aria-pressed="true">All <span class="chip-count">${total}</span></button>`,
  ]
    .concat(
      groups.map(
        (group) =>
          `<button class="chip" type="button" data-filter="${escapeHtml(group.id)}" aria-pressed="false">${escapeHtml(group.label)} <span class="chip-count">${group.projects.length}</span></button>`
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
      chips.forEach((other) => {
        const isActive = other === chip;
        other.classList.toggle("is-active", isActive);
        other.setAttribute("aria-pressed", String(isActive));
      });
      groups.forEach((group) => {
        group.hidden = filter !== "all" && group.dataset.category !== filter;
      });
    });
  });
}
