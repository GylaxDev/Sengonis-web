/* Rendering and page navigation. */

import { auth } from "../model/auth.js";
import { ui } from "../model/ui.js";
import { $ } from "../core/utils.js";
import { appShell, navigation } from "../view/layout.js";
import { loginView } from "../view/login.js";
import { homePage } from "../view/pages/home.js";
import { plantsPage } from "../view/pages/plants.js";
import { inventoryPage } from "../view/pages/inventory.js";
import { reportsPage } from "../view/pages/reports.js";
import { usersPage } from "../view/pages/users.js";
import { settingsPage } from "../view/settings.js";
import { mapPage } from "../view/map.js";
import { resetTablePages } from "../view/table.js";
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

const afterRender = [];

export function onRendered(callback) {
  afterRender.push(callback);
}

export function navigate(view) {
  ui.view = view;
  ui.query = "";
  ui.animate = true;
  resetTablePages();
  render();
  window.scrollTo(0, 0);
}

export function showTab(tab) {
  ui.tab = tab;
  ui.query = "";
  ui.animate = true;
  render();
}

export function showSettingsSection(section) {
  ui.settingsSection = section;
  ui.animate = false;
  render();
}

function bindLogin() {
  const form = $("#lf");
  if (!form) return;

  form.onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(form);
    attemptLogin(
      String(data.get("u") ?? "").trim(),
      String(data.get("p") ?? ""),
    );
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

  const buildPage = pages[ui.view] || pages.home;
  app.innerHTML = appShell(buildPage());

  document.title =
    (navigation().find((item) => item[0] === ui.view) || [0, "Sengonis"])[1] +
    " · Sengonis";

  afterRender.forEach((callback) => callback(ui.view));
  refreshWeather();
}
