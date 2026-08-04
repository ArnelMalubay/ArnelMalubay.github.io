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

  const site = clean.site;
  const projectGroups = groupProjects(clean.categories, clean.projects);

  // A section shows when at least one thing inside it has data. #about and
  // #education each hold two independent lists, so one empty list hides only
  // itself.
  const shows = {
    about: Boolean(site) || clean.skills.length > 0,
    projects: projectGroups.length > 0,
    experience: clean.experience.length > 0,
    certifications: clean.certifications.length > 0,
    education: clean.education.length > 0 || clean.publications.length > 0,
    contact: Boolean(site),
  };

  // Numbers are assigned over the sections that actually show, in page order,
  // so hiding one never leaves a gap (01, 02, 03, 05, 06). Sections that show
  // nothing are hidden along with their nav link.
  const number = {};
  let shown = 0;
  ["about", "projects", "experience", "certifications", "education", "contact"].forEach((id) => {
    if (shows[id]) {
      shown += 1;
      number[id] = String(shown).padStart(2, "0");
    } else {
      hideSection(id);
    }
  });

  if (site) {
    mount("hero", renderHero(site));
    applySeo(site.seo);
    mount("footer-body", renderFooter(site));
  } else {
    hideMount("hero");
    hideMount("footer-body");
  }

  if (shows.about) {
    mount("about-body", renderAbout(site, number.about));
    if (clean.skills.length > 0) {
      mount("skills-list", renderSkills(clean.skills));
    } else {
      hideMount("skills-list");
    }
  }

  if (shows.projects) {
    mount(
      "project-filters",
      sectionHeader(number.projects, "Research & Projects") + renderProjectFilters(projectGroups)
    );
    mount("projects-body", renderProjectGroups(projectGroups));
    initProjectFilters();
  }

  if (shows.experience) {
    mount("experience-list", renderExperience(clean.experience, number.experience));
  }

  if (shows.certifications) {
    mount("certifications-list", renderCertifications(clean.certifications, number.certifications));
  }

  if (shows.education) {
    // The header sits above both columns, so it mounts on its own.
    mount("education-header", sectionHeader(number.education, "Education"));
    if (clean.education.length > 0) {
      mount("education-list", renderEducation(clean.education));
    } else {
      hideMount("education-list");
    }
    if (clean.publications.length > 0) {
      mount("publications-list", renderPublications(clean.publications));
    } else {
      hideMount("publications-list");
    }
  }

  if (shows.contact) {
    mount("contact-body", renderContact(site, number.contact));
  }

  initTheme();
  initNav();
  initReveal();
});
