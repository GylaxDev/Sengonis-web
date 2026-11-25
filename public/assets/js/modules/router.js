/* Rendering, page navigation and browser URL sync. */

import { auth } from "./auth.js";
import { ui } from "./ui.js";
import { $ } from "../core/utils.js";
import { appShell, navigation } from "../views/layout.js";
import { loginView } from "../views/login.js";
import { homePage } from "../views/pages/home.js";
import { plantsPage } from "../views/pages/plants.js";
import { inventoryPage } from "../views/pages/inventory.js";
import { reportsPage } from "../views/pages/reports.js";
import { usersPage } from "../views/pages/users.js";
import { settingsPage } from "../views/settings.js";
import { mapPage } from "../views/map.js";
import { resetTablePages } from "../views/table.js";
import { attemptLogin, sessionView } from "./session.js";
import { refreshWeather } from "./weather.js";

const pages = {
  home: homePage,
  plants: plantsPage,
  map: mapPage,
  inventory: inventoryPage,
  reports: reportsPage,
  users: usersPage,
  settings: settingsPage,
};

const VIEWS = Object.keys(pages);
const SETTINGS_SECTIONS = new Set([
  "profile",
  "appearance",
  "prefs",
  "plantation",
  "security",
  "data",
  "about",
]);
const REPORT_TABS = new Set(["fin", "dead", "log"]);

/* The app can be served from a domain root or a subfolder (e.g. /V2/).
   Work out the prefix once, before any navigation rewrites the path. */
function detectBasePath() {
  // index.html sets <base> synchronously before any asset is requested, so
  // document.baseURI is the single source of truth for deep links and subfolders.
  const path = new URL(document.baseURI).pathname.replace(/\/+$/, "");
  return path || "/";
}

const basePath = detectBasePath();
const afterRender = [];

function pathFor(view) {
  const prefix = basePath === "/" ? "" : basePath;
  if (view === "home") return prefix || "/";
  return `${prefix}/${view}`;
}

/* Keep the address bar in step with the current UI state. Filters that only
   affect a table are deliberately left out; q/section/tab/arch are shareable. */
function writeRoute(mode = "replace") {
  if (!auth.current) return;
  if (!VIEWS.includes(ui.view)) ui.view = "home";

  try {
    const url = new URL(location.href);
    url.pathname = pathFor(ui.view);
    url.search = "";
    url.hash = "";

    if (ui.query) url.searchParams.set("q", ui.query);
    if (
      ui.view === "settings" &&
      ui.settingsSection !== "profile" &&
      SETTINGS_SECTIONS.has(ui.settingsSection)
    ) {
      url.searchParams.set("section", ui.settingsSection);
    }
    if (ui.view === "reports") {
      if (REPORT_TABS.has(ui.tab) && ui.tab !== "fin") {
        url.searchParams.set("tab", ui.tab);
      }
      if (ui.showArchived) url.searchParams.set("arch", "1");
    }

    history[mode === "push" ? "pushState" : "replaceState"]({}, "", url);
  } catch (error) {
    /* Some hosts (e.g. file://) do not allow the History API. */
  }
}

/* Read a deep link back into the UI state. Unknown values are ignored. */
export function readRoute() {
  const segments = location.pathname.split("/").filter(Boolean);

  // Find a recognised view anywhere in the path (so a subfolder base path
  // like /V2/settings still resolves to "settings"); fall back to home when
  // the address does not name a view (e.g. "/" or "/unknown/path").
  let view = null;
  for (let index = segments.length - 1; index >= 0; index--) {
    if (VIEWS.includes(segments[index])) {
      view = segments[index];
      break;
    }
  }
  ui.view = view || "home";

  const params = new URLSearchParams(location.search);
  ui.query = params.get("q") || "";

  const section = params.get("section");
  if (section && SETTINGS_SECTIONS.has(section)) {
    if (section !== "plantation" || auth.isOwner()) ui.settingsSection = section;
  }

  const tab = params.get("tab");
  if (tab && REPORT_TABS.has(tab) && (tab !== "log" || auth.isOwner())) {
    ui.tab = tab;
  }
  ui.showArchived = params.get("arch") === "1";
}

export function installRouting() {
  window.addEventListener("popstate", () => {
    readRoute();
    ui.animate = false;
    resetTablePages();
    render();
  });
}

export function onRendered(callback) {
  afterRender.push(callback);
}

export function navigate(view, query = "") {
  if (!VIEWS.includes(view)) view = "home";
  ui.view = view;
  ui.query = query || "";
  ui.animate = true;
  resetTablePages();
  writeRoute("push");
  render();
  try {
    window.scrollTo(0, 0);
  } catch (error) {
    /* Some test environments do not implement scrollTo. */
  }
}

export function showTab(tab) {
  if (REPORT_TABS.has(tab) && (tab !== "log" || auth.isOwner())) {
    ui.tab = tab;
  }
  ui.query = "";
  ui.animate = true;
  writeRoute("replace");
  render();
}

export function showSettingsSection(section) {
  if (SETTINGS_SECTIONS.has(section)) {
    if (section !== "plantation" || auth.isOwner()) {
      ui.settingsSection = section;
    }
  }
  ui.animate = false;
  writeRoute("replace");
  render();
}

function bindLogin() {
  const form = $("#lf");
  if (!form) return;

  form.onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const loggedIn = attemptLogin(
      String(data.get("u") ?? "").trim(),
      String(data.get("p") ?? ""),
    );
    // readRoute() ran before there was a session, so role-gated deep links
    // (e.g. ?section=plantation) were skipped. Re-read now that auth is known.
    if (loggedIn) readRoute();
    render();
  };
}

export function render() {
  const app = document.getElementById("app");
  app.className = ui.animate ? "enter" : "";
  ui.animate = false;

  if (!auth.current) {
    app.innerHTML = loginView(sessionView);
    bindLogin();
    return;
  }

  if (ui.view === "users" && !auth.isOwner()) ui.view = "home";
  if (!VIEWS.includes(ui.view)) ui.view = "home";
  writeRoute("replace");

  const buildPage = pages[ui.view] || pages.home;
  app.innerHTML = appShell(buildPage());

  document.title =
    (navigation().find((item) => item[0] === ui.view) || [0, "Sengonis"])[1] +
    " · Sengonis";

  afterRender.forEach((callback) => callback(ui.view));
  refreshWeather();
}
