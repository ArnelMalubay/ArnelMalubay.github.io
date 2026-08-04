// Loads every data/*.js file and runs the shared validator.
// Usage: node tools/check-data.js
// Exit code 0 = no errors (warnings allowed), 1 = at least one error.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const DATA_FILES = [
  "site.js",
  "projects.js",
  "experience.js",
  "certifications.js",
  "education.js",
  "publications.js",
  "skills.js",
];

// data/*.js declare top-level `const`s. Lexical declarations do NOT attach to a
// vm sandbox object, so concatenate every file into one script and end with an
// expression that hands the bindings back.
const sources = [];
for (const file of DATA_FILES) {
  const filePath = path.join(ROOT, "data", file);
  if (!fs.existsSync(filePath)) {
    console.log(`skipped data/${file} (not created yet)`);
    continue;
  }
  sources.push(fs.readFileSync(filePath, "utf8"));
}

const collector = `;({
  site: typeof siteData !== "undefined" ? siteData : undefined,
  categories: typeof projectCategories !== "undefined" ? projectCategories : undefined,
  projects: typeof projectsData !== "undefined" ? projectsData : undefined,
  experience: typeof experienceData !== "undefined" ? experienceData : undefined,
  certifications: typeof certificationsData !== "undefined" ? certificationsData : undefined,
  education: typeof educationData !== "undefined" ? educationData : undefined,
  publications: typeof publicationsData !== "undefined" ? publicationsData : undefined,
  skills: typeof skillsData !== "undefined" ? skillsData : undefined,
})`;

let data;
try {
  data = vm.runInNewContext(sources.join("\n;\n") + collector, {}, { filename: "data-bundle.js" });
} catch (error) {
  console.error(`Failed to parse data files: ${error.message}`);
  process.exit(1);
}

const { validatePortfolioData } = require(path.join(ROOT, "js", "validate.js"));
const { ok, issues } = validatePortfolioData(data);

for (const issue of issues) {
  console.log(`${issue.level.toUpperCase()}: ${issue.message}`);
}
console.log(`\n${issues.filter((i) => i.level === "error").length} error(s), ${issues.filter((i) => i.level === "warning").length} warning(s)`);
process.exit(ok ? 0 : 1);
