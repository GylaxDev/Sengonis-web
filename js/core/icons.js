/* Lucide icons are loaded from the CDN in index.html.
   ic() writes a placeholder; drawIcons() swaps it for the real SVG. */

const ALIASES = {
  home: "house",
  box: "package",
  report: "file-text",
  edit: "pencil",
  trash: "trash-2",
  shield: "shield-check",
  logout: "log-out",
  trend: "trending-up",
  alert: "triangle-alert",
  spark: "sparkles",
};

export const BUTTON_ICONS = {
  Edit: "edit",
  Delete: "trash",
  Validate: "check",
  Reject: "x",
  Verify: "shield",
  Archive: "archive",
  Deactivate: "ban",
  Reactivate: "rotate-ccw",
  Redraw: "edit",
  Locate: "map-pin",
};

export const ic = (name) =>
  `<i data-lucide="${ALIASES[name] || name}" class="ic"></i>`;

export function drawIcons() {
  if (window.lucide && document.querySelector("i[data-lucide]")) {
    window.lucide.createIcons();
  }
}

new MutationObserver(drawIcons).observe(document.body, {
  childList: true,
  subtree: true,
});

window.addEventListener("load", drawIcons);
