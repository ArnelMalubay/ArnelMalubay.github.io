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
