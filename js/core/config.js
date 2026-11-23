/* Application constants, persisted settings and defaults. */

export const STORAGE = {
  data: "sengonis_v1",
  settings: "sengonis_settings",
  session: "sengonis_session",
  weather: "sengonis_wx",
  legacyTheme: "sengonis_theme",
};

export const CAUSES = [
  "Fungal disease",
  "Drought",
  "Pests (boktor)",
  "Waterlogging",
  "Storm damage",
  "Unknown",
];

export const STATUSES = ["Seedling", "Growing", "Mature", "Dead"];

export const TRANSACTION_TYPES = ["Seedling purchase", "Operations", "Sale"];

/* Audit-trail wording, keyed by the action that was clicked. */
export const ACTION_LABELS = {
  pa: "Added plant",
  pe: "Edited plant",
  pd: "Deleted plant",
  fa: "Added transaction",
  fe: "Edited transaction",
  fv: "Validated transaction",
  fr: "Rejected transaction",
  la: "Created financial report",
  le: "Edited financial report",
  lv: "Verified financial report",
  lz: "Archived financial report",
  da: "Created mortality report",
  de: "Edited mortality report",
  dv: "Verified mortality report",
  dz: "Archived mortality report",
  ua: "Added field officer",
  ue: "Edited user",
  ud: "Deactivated user",
  ur: "Reactivated user",
  mp: "Added plant (map)",
  bka: "Added block",
  bke: "Redrew block",
  bkd: "Deleted block",
  mv: "Moved plantation",
};

/* Settings defaults (Settings page). Stored per browser in localStorage. */
export const DEFAULTS = {
  theme: "system",
  accent: "yellow",
  density: "comfortable",
  fs: "md",
  motion: true,
  sidebar: "full",
  landing: "home",
  period: 6,
  rows: 10,
  dateFmt: "iso",
  tempUnit: "C",
  windUnit: "kmh",
  wxAlerts: true,
  keep: true,
  autoLogout: 0,
  plantName: "Sengon Plantation",
  loss: 45000,
  rainMm: 60,
  hotC: 33,
};

/* Map defaults. */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
export const DEFAULT_CENTER = [113.718, -8.14];

/* Colours shared by the map layers and its legend. */
export const MAP_COLORS = {
  Seedling: "#9ed36a",
  Growing: "#4c9a3a",
  Mature: "#1f6b2a",
  Dead: "#8d8d8d",
};

/* Colours used by the dashboard growth-stage chart. */
export const STAGE_CHART_COLORS = {
  Seedling: "var(--blue)",
  Growing: "var(--acc)",
  Mature: "#6d5d3f",
  Dead: "var(--taupe)",
};

/* Mutable settings object, loaded from localStorage by loadSettings(). */
export const config = { ...DEFAULTS };

export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.settings));
    if (saved) {
      Object.assign(config, saved);
      return;
    }
    const legacyTheme = localStorage.getItem(STORAGE.legacyTheme);
    if (legacyTheme) config.theme = legacyTheme;
  } catch (error) {
    /* Corrupt settings are ignored; defaults stay in place. */
  }
}

export function saveSettings() {
  try {
    localStorage.setItem(STORAGE.settings, JSON.stringify(config));
  } catch (error) {
    /* Storage can be unavailable in private mode; the app still works. */
  }
}
