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

  if (clean.site) {
    mount("hero", renderHero(clean.site));
    if (clean.site.seo && clean.site.seo.title) {
      document.title = clean.site.seo.title;
    }
    mount("about-body", renderAbout(clean.site));
  }

  if (clean.skills.length > 0) {
    mount("skills-list", renderSkills(clean.skills));
  } else {
    hideSection("skills-list");
  }

  const projectGroups = groupProjects(clean.categories, clean.projects);
  if (projectGroups.length > 0) {
    mount("project-filters", sectionHeader("02", "Research & Projects") + renderProjectFilters(projectGroups));
    mount("projects-body", renderProjectGroups(projectGroups));
    initProjectFilters();
  } else {
    hideSection("projects-body");
  }

  if (clean.experience.length > 0) {
    mount("experience-list", renderExperience(clean.experience));
  } else {
    hideSection("experience-list");
  }

  initTheme();
  initNav();
  initReveal();
});
