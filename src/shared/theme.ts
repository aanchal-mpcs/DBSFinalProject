import type { ThemePreference } from "./types";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveThemePreference(themePreference: ThemePreference): "light" | "dark" {
  if (themePreference === "system") {
    return getSystemTheme();
  }

  return themePreference;
}

export function applyThemePreference(themePreference: ThemePreference): void {
  const resolvedTheme = resolveThemePreference(themePreference);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.dataset.themePreference = themePreference;
}

export function getNextThemePreference(themePreference: ThemePreference): ThemePreference {
  if (themePreference === "system") return "dark";
  if (themePreference === "dark") return "light";
  return "system";
}

export function getThemePreferenceLabel(themePreference: ThemePreference): string {
  if (themePreference === "system") return "Theme: System";
  if (themePreference === "dark") return "Theme: Dark";
  return "Theme: Light";
}
