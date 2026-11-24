/* Application shell: navigation, sidebar, top bar and notifications. */

import { config } from "../core/config.js";
import { esc } from "../core/utils.js";
import { ic } from "../core/icons.js";
import { auth } from "../modules/auth.js";
import { state } from "../modules/store.js";
import { ui } from "../modules/ui.js";
import { pendingCounts } from "../modules/reports.js";
import { currentWeather, weatherAdvice } from "../modules/weather-data.js";
import { avatar, logo } from "./components.js";

export function navigation() {
  return [
    ["home", "Home", "home"],
    ["plants", "Plants", "sprout"],
    ["map", "Map", "map"],
    ["inventory", "Inventory", "box"],
    ["reports", "Reports", "report"],
    ...(auth.isOwner() ? [["users", "Users", "users"]] : []),
    ["settings", "Settings", "settings"],
  ];
}

export function createActions() {
  return [
    ["pa", "sprout", "Add plant", "Record a new tree"],
    ...(auth.isOwner()
      ? [
          ["ua", "user-plus", "Add field officer", "Create an account"],
          ["cblk", "square-dashed", "Add block on map", "Draw a boundary"],
        ]
      : [
          ["fa", "receipt", "Add transaction", "Purchase, cost or sale"],
          ["la", "file-text", "New financial report", "Monthly summary"],
          ["da", "triangle-alert", "New mortality report", "Record lost trees"],
        ]),
  ];
}

export function notificationItems() {
  const pending = pendingCounts();
  const items = [];
  const plural = (count) => (count > 1 ? "s" : "");

  if (pending.transactions) {
    items.push({
      i: "receipt",
      t: auth.isOwner()
        ? `${pending.transactions} transaction${plural(pending.transactions)} to validate`
        : `${pending.transactions} transaction${plural(pending.transactions)} awaiting approval`,
      s: "Inventory",
      a: "pinv",
    });
  }
  if (pending.financial) {
    items.push({
      i: "file-text",
      t: auth.isOwner()
        ? `${pending.financial} financial report${plural(pending.financial)} to verify`
        : `${pending.financial} financial report draft${plural(pending.financial)}`,
      s: "Reports",
      a: "plap",
    });
  }
  if (pending.mortality) {
    items.push({
      i: "triangle-alert",
      t: auth.isOwner()
        ? `${pending.mortality} mortality report${plural(pending.mortality)} to verify`
        : `${pending.mortality} mortality report draft${plural(pending.mortality)}`,
      s: "Reports",
      a: "pmor",
    });
  }

  const weather = currentWeather();
  if (config.wxAlerts && weather) {
    const [text, level] = weatherAdvice(weather);
    if (level) {
      items.push({
        i: level > 1 ? "cloud-lightning" : "cloud-rain",
        c: level > 1 ? "bad" : "warn",
        t: "Weather alert",
        s: text,
        a: "go",
        d: "home",
      });
    }
  }

  return items;
}

export function bellInner() {
  const items = notificationItems();
  return `<button class="ibtn" data-a="pop" data-i="p-n" aria-label="Notifications">${ic(
    "bell",
  )}${
    items.length ? `<span class="badge">${items.length}</span>` : ""
  }</button><div class="pop" id="p-n" hidden><h4>NOTIFICATIONS</h4>${items
    .map(
      (item) =>
        `<button class="pi" data-a="${item.a}"${
          item.d ? ` data-i="${item.d}"` : ""
        }><span class="dot ${item.c || ""}">${ic(
          item.i,
        )}</span><span><b style="font-weight:500">${item.t}</b><small>${
          item.s
        }</small></span></button>`,
    )
    .join("") || '<div class="empty">You\'re all caught up.</div>'}</div>`;
}

export function paintBell() {
  const element = document.getElementById("bell");
  if (element) element.innerHTML = bellInner();
}

export function sidebar() {
  const pending = pendingCounts();
  const counts = {
    inventory: auth.isOwner() ? pending.transactions : 0,
    reports: auth.isOwner() ? pending.financial + pending.mortality : 0,
  };
  const living = state.tan.filter((plant) => plant.st !== "Dead").length;

  return `<aside class="sb" aria-label="Main navigation"><div class="sbtop"><button class="ibtn plain" data-a="nav" aria-label="Toggle sidebar">${ic(
    "menu",
  )}</button><button class="brand" data-a="go" data-i="home" aria-label="Sengonis home">${logo()}<span class="wm">sengonis</span></button></div>
  <div class="create pw"><button class="btn" data-a="pop" data-i="p-c" aria-label="Create">${ic(
    "plus",
  )}<span class="lbl">Create</span></button><div class="pop createmenu" id="p-c" hidden>${createActions()
    .map(
      (item) =>
        `<button class="pi" data-a="${item[0]}"><span class="dot">${ic(
          item[1],
        )}</span><span><b style="font-weight:500">${
          item[2]
        }</b><small>${item[3]}</small></span></button>`,
    )
    .join("")}</div></div>
  <nav class="nav">${navigation()
    .map(
      (item) =>
        `${item[0] === "settings" ? "<hr>" : ""}<button data-a="go" data-i="${
          item[0]
        }" title="${item[1]}"${
          ui.view === item[0] ? ' aria-current="page"' : ""
        }>${ic(item[2])}<span class="lbl">${item[1]}</span>${
          counts[item[0]] ? `<span class="cnt">${counts[item[0]]}</span>` : ""
        }</button>`,
    )
    .join("")}</nav>
  <div class="sbfoot"><b>${esc(
    config.plantName,
  )}</b><span>${living} living trees · ${
    state.geo.b.length
  } blocks</span></div></aside>`;
}

export function topbar() {
  const isDark =
    document.documentElement.dataset.theme === "dark" ||
    config.theme === "dark";

  return `<header class="topbar"><button class="ibtn plain menubtn" data-a="nav" aria-label="Open menu">${ic(
    "menu",
  )}</button><button class="spill" data-a="pal" aria-label="Search">${ic(
    "search",
  )}<span>Search plants, transactions and pages</span><kbd>Ctrl K</kbd></button><div class="sp"></div>
  <button class="ibtn tm" data-a="theme2" aria-label="Toggle dark mode">${ic(
    isDark ? "sun" : "moon",
  )}</button><div class="pw" id="bell">${bellInner()}</div>
  <div class="pw"><button class="avbtn" data-a="pop" data-i="p-u" aria-label="Account">${avatar(
    auth.current,
  )}</button><div class="pop" id="p-u" hidden><div class="who"><span class="av">${avatar(
    auth.current,
  )}</span><div><b>${esc(auth.current.nama)}</b><small>${esc(
    auth.current.role,
  )}</small></div></div><hr><button class="pi" data-a="go" data-i="settings">${ic(
    "settings",
  )}<span>Settings</span></button><button class="pi" data-a="pal">${ic(
    "search",
  )}<span>Search<small>Ctrl K</small></span></button><button class="pi" data-a="out">${ic(
    "log-out",
  )}<span>Sign out</span></button></div></div></header>`;
}

export function appShell(content) {
  return `<div class="shell${
    config.sidebar === "mini" ? " sbm" : ""
  }">${sidebar()}<div class="scrim" data-a="nav"></div><div class="body">${topbar()}<main class="main" id="main"><div class="wrap">${content}</div></main></div></div>`;
}
