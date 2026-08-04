// Light/dark toggle. The initial value is applied by an inline script in
// <head> before first paint, so there is no flash of the wrong theme.
const THEME_STORAGE_KEY = "portfolio-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const button = document.getElementById("theme-toggle");
  if (button) {
    const isDark = theme === "dark";
    button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    button.innerHTML = isDark
      ? '<i class="fas fa-sun" aria-hidden="true"></i>'
      : '<i class="fas fa-moon" aria-hidden="true"></i>';
  }
}

function initTheme() {
  applyTheme(document.documentElement.getAttribute("data-theme") || "light");
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      console.warn("Theme preference could not be saved:", error.message);
    }
  });
}
