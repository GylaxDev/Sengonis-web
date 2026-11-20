/* Applies persisted appearance settings to the document. */

import { config } from "../config.js";

export function applyTheme() {
  const root = document.documentElement;

  if (config.theme === "system") root.removeAttribute("data-theme");
  else root.dataset.theme = config.theme;

  root.dataset.accent = config.accent;
  root.dataset.density = config.density;
  root.dataset.fs = config.fs;
  root.dataset.motion = config.motion ? "on" : "off";

  const meta = document.querySelector("meta[name=theme-color]");
  if (meta) {
    const dark =
      config.theme === "dark" ||
      (config.theme === "system" &&
        matchMedia("(prefers-color-scheme:dark)").matches);
    meta.content = dark ? "#131312" : "#ffffff";
  }
}
