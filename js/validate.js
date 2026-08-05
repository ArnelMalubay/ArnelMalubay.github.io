// Shared data validation. Runs in the browser (js/main.js) and under Node
// (tools/check-data.js). Never throws — bad data degrades, it does not blank
// the page.

// The file each global lives in, so a message can name the file to open.
const PORTFOLIO_DATA_FILES = {
  siteData: "data/site.js",
  projectCategories: "data/projects.js",
  projectsData: "data/projects.js",
  experienceData: "data/experience.js",
  certificationsData: "data/certifications.js",
  educationData: "data/education.js",
  publicationsData: "data/publications.js",
  skillsData: "data/skills.js",
};

function validatePortfolioData(data) {
  const issues = [];
  const error = (message) => issues.push({ level: "error", message });
  const warn = (message) => issues.push({ level: "warning", message });

  // Guard against null, undefined, or non-object data argument
  if (data === null || data === undefined || typeof data !== "object" || Array.isArray(data)) {
    warn("Data argument is not a valid object");
    return { ok: true, issues, clean: { site: undefined, categories: [], projects: [], experience: [], certifications: [], education: [], publications: [], skills: [] } };
  }

  const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  // Returns true when every required field is present.
  const requireFields = (label, obj, fields) => {
    // Guard against null, undefined, or non-object entries
    if (obj === null) {
      error(`${label}: entry is null`);
      return false;
    }
    if (obj === undefined || typeof obj !== "object") {
      error(`${label}: expected an object, got ${typeof obj}`);
      return false;
    }
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
  // rendered as a blank card. `emptyEffect` spells out what actually happens
  // when the list is missing or empty, so the message matches the page.
  const checkList = (key, list, label, requiredFields, emptyEffect) => {
    const file = PORTFOLIO_DATA_FILES[key] || key;
    if (list === undefined) {
      warn(`${key} is not defined yet in ${file} — ${emptyEffect}`);
      return [];
    }
    if (!Array.isArray(list)) {
      error(`${key} in ${file} must be an array, got ${typeof list}`);
      return [];
    }
    if (list.length === 0) {
      warn(`${key} is empty — ${emptyEffect}`);
      return [];
    }
    // Indexed loop, not .filter: filter silently skips array holes, and a
    // stray double comma (`[a,, b]`) is the easiest mistake to make when
    // hand-editing these files. A hole has to be reported, not swallowed.
    const kept = [];
    for (let index = 0; index < list.length; index += 1) {
      if (!(index in list)) {
        error(
          `${key}[${index}] in ${file} is an empty slot — probably a double comma in the array. Nothing renders for it.`
        );
        continue;
      }
      const entry = list[index];
      if (requireFields(`${label} #${index + 1}`, entry, requiredFields)) {
        kept.push(entry);
      } else {
        warn(`${key}[${index}] was skipped because of the error above`);
      }
    }
    return kept;
  };

  // --- site ---
  let cleanSite;
  if (data.site === undefined) {
    warn("siteData is not defined yet in data/site.js — the hero, About text, Contact, and footer will be hidden");
  } else if (data.site === null || typeof data.site !== "object" || Array.isArray(data.site)) {
    // Reject non-objects here rather than reading fields off them below:
    // `data.site.seo` on a null site used to throw, and a throw escaping the
    // validator aborts main.js before it can log anything.
    error(
      `siteData in data/site.js must be an object, got ${data.site === null ? "null" : typeof data.site} — the hero, About text, Contact, and footer will be hidden`
    );
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
  // No ternary here: an undefined projectCategories has to report something
  // too, and without categories every project falls into the "Other" group
  // rather than the section disappearing.
  const categories = checkList(
    "projectCategories",
    data.categories,
    "Category",
    ["id", "label"],
    'every project will render in a single "Other" group'
  );
  const categoryIds = new Set(categories.map((category) => category.id));

  const projects = checkList(
    "projectsData",
    data.projects,
    "Project",
    ["id", "title", "category", "description"],
    "the Research & Projects section will be hidden"
  );
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
    if (project.zoom !== undefined) {
      const zoom = Number(project.zoom);
      if (!Number.isFinite(zoom) || zoom <= 0) {
        warn(`${label}: zoom must be a positive number — ignoring it and rendering at 1`);
      } else if (zoom < 0.25 || zoom > 4) {
        warn(`${label}: zoom ${zoom} is outside the supported 0.25–4 range — clamping`);
      }
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
    experience: checkList(
      "experienceData",
      data.experience,
      "Experience",
      ["company", "role", "start", "bullets"],
      "the Experience section will be hidden"
    ),
    certifications: checkList(
      "certificationsData",
      data.certifications,
      "Certification",
      ["name", "issuer", "earned"],
      "the Certifications section will be hidden"
    ),
    education: checkList(
      "educationData",
      data.education,
      "Education",
      ["school", "degree", "start", "end"],
      "the Education list will be hidden; the section still renders if there are publications"
    ),
    publications: checkList(
      "publicationsData",
      data.publications,
      "Publication",
      ["title", "venue", "date", "type"],
      "the Publications list will be hidden; the section still renders if there are degrees"
    ),
    skills: checkList(
      "skillsData",
      data.skills,
      "Skill group",
      ["label", "items"],
      "the Technical Skills list will be hidden; the About section still renders"
    ),
  };

  return { ok: issues.every((issue) => issue.level !== "error"), issues, clean };
}

// Node (tools/check-data.js) only. Browsers ignore this branch.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validatePortfolioData };
}
