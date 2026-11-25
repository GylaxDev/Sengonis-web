/* Settings page. Appearance and preferences are stored per browser;
   profile and password belong to the signed-in user. */

import { config } from "../core/config.js";
import { esc } from "../core/utils.js";
import { ic } from "../core/icons.js";
import { auth } from "../modules/auth.js";
import { state } from "../modules/store.js";
import { ui } from "../modules/ui.js";
import { avatar, pageHead } from "./components.js";

export function settingsSections() {
  return [
    ["profile", "Profile", "user"],
    ["appearance", "Appearance", "palette"],
    ["prefs", "Preferences", "sliders-horizontal"],
    ...(auth.isOwner() ? [["plantation", "Plantation", "trees"]] : []),
    ["security", "Security", "lock"],
    ["data", "Data & backup", "database"],
    ["about", "Shortcuts & about", "keyboard"],
  ];
}

const row = (title, description, control) =>
  `<div class="srow"><div><b>${title}</b>${
    description ? `<small>${description}</small>` : ""
  }</div><div class="sctl">${control}</div></div>`;

const configSelect = (key, options, numeric) =>
  `<select data-c="${key}"${numeric ? ' data-n="1"' : ""} aria-label="${key}">${options
    .map((option) => {
      const [value, label] = Array.isArray(option)
        ? option
        : [option, option];
      return `<option value="${esc(value)}"${
        String(config[key]) === String(value) ? " selected" : ""
      }>${esc(label)}</option>`;
    })
    .join("")}</select>`;

const toggle = (key) =>
  `<label class="sw"><input type="checkbox" data-c="${key}"${
    config[key] ? " checked" : ""
  } aria-label="${key}"><span></span></label>`;

const segmentedConfig = (key, options) =>
  `<div class="seg" role="group">${options
    .map(
      (option) =>
        `<button data-a="cfg" data-i="${key}|${option[0]}" aria-pressed="${
          String(config[key]) === String(option[0])
        }">${option[2] ? ic(option[2]) : ""}${option[1]}</button>`,
    )
    .join("")}</div>`;

const box = (title, subtitle, body) =>
  `<section class="card"><div class="ch-h"><h2>${title}${
    subtitle ? `<small>${subtitle}</small>` : ""
  }</h2></div>${body}</section>`;

const shortcut = (keys, description) =>
  `<div><span>${description}</span><span>${keys
    .map((key) => `<kbd>${key}</kbd>`)
    .join(" ")}</span></div>`;

function profileSection() {
  const user = auth.current;
  return box(
    "Profile",
    "How you appear to your team.",
    `<div class="prof"><span class="av">${avatar(
      user,
    )}</span><div class="row"><button class="btn sm ghost" data-a="photo">${ic(
      "camera",
    )}${user.foto ? "Change" : "Add"} photo</button>${
      user.foto
        ? `<button class="btn sm ghost" data-a="photox">${ic(
            "trash",
          )}Remove</button>`
        : ""
    }</div><input type="file" id="pf" accept="image/*" hidden></div>
   <form id="pfm" class="col" novalidate><div class="fgrid"><label class="fld">Full name<input id="pn" value="${esc(
     user.nama,
   )}" autocomplete="name"></label><label class="fld">Phone number<input id="pt" value="${esc(
     user.telp,
   )}" inputmode="tel" autocomplete="tel"></label><label class="fld">Username<input value="${esc(
     user.username,
   )}" disabled><small>Usernames can only be changed by the owner.</small></label><label class="fld">Role<input value="${esc(
     user.role,
   )}" disabled></label></div><p class="err" id="pfe"></p><div class="row"><button class="btn" data-a="profsave" type="button">Save profile</button></div></form>`,
  );
}

function appearanceSection() {
  const themes = [
    ["light", "Light", "#fff", "#faf6ef", "#202124"],
    ["dark", "Dark", "#131312", "#201e1a", "#f2efe8"],
    ["system", "System", "", "", ""],
  ];

  const cards = themes
    .map((theme) => {
      const system = theme[0] === "system";
      const background = system
        ? "linear-gradient(90deg,#fff 50%,#131312 50%)"
        : theme[2];
      const preview = system
        ? "linear-gradient(90deg,#faf6ef 50%,#201e1a 50%)"
        : theme[3];
      return `<button class="theme" data-a="cfg" data-i="theme|${
        theme[0]
      }" aria-pressed="${config.theme === theme[0]}"><span class="tp" style="--a:${
        system ? "#888" : theme[4]
      };--b:${system ? "#bbb" : theme[4] + "55"}"><i style="background:${preview}"></i><i style="background:${background}"><b></b><b></b></i></span><span>${
        theme[1]
      }</span></button>`;
    })
    .join("");

  const accents = [
    ["yellow", "#fbc315"],
    ["green", "#3fa564"],
    ["blue", "#4a90b8"],
    ["rose", "#d4568b"],
  ]
    .map(
      ([name, colour]) =>
        `<button data-a="cfg" data-i="accent|${name}" style="background:${colour}" aria-label="${name}" aria-pressed="${
          config.accent === name
        }">${ic("check")}</button>`,
    )
    .join("");

  return box(
    "Appearance",
    "Applies to this device immediately.",
    `<div class="themes" role="group" aria-label="Theme">${cards}</div>` +
      row(
        "Accent colour",
        "Charts, highlights, switches and artwork.",
        `<div class="sws">${accents}</div>`,
      ) +
      row(
        "Density",
        "Compact fits more rows on screen.",
        segmentedConfig("density", [
          ["comfortable", "Comfortable"],
          ["compact", "Compact"],
        ]),
      ) +
      row(
        "Text size",
        "Scales all text and spacing.",
        segmentedConfig("fs", [
          ["sm", "Small"],
          ["md", "Default"],
          ["lg", "Large"],
        ]),
      ) +
      row("Animations", "Page transitions and chart motion.", toggle("motion")) +
      row(
        "Sidebar",
        "Start with icons only to leave more room.",
        segmentedConfig("sidebar", [
          ["full", "Expanded"],
          ["mini", "Icons only"],
        ]),
      ),
  );
}

function preferencesSection() {
  return box(
    "Preferences",
    "Stored on this device.",
    row(
      "Start page",
      "Where you land after signing in.",
      configSelect("landing", [
        ["home", "Home"],
        ["plants", "Plants"],
        ["map", "Map"],
        ["inventory", "Inventory"],
        ["reports", "Reports"],
        ...(auth.isOwner() ? [["users", "Users"]] : []),
      ]),
    ) +
      row(
        "Dashboard period",
        "Default range for the trend charts.",
        configSelect(
          "period",
          [
            [3, "Last 3 months"],
            [6, "Last 6 months"],
            [12, "Last 12 months"],
          ],
          true,
        ),
      ) +
      row(
        "Rows per page",
        "How many rows tables show before paging.",
        configSelect(
          "rows",
          [
            [10, "10"],
            [25, "25"],
            [50, "50"],
            [100, "100"],
            [0, "Show all"],
          ],
          true,
        ),
      ) +
      row(
        "Date format",
        "Used in tables and reports.",
        configSelect("dateFmt", [
          ["iso", "2026-11-18"],
          ["id", "18/11/2026"],
          ["en", "18 Nov 2026"],
        ]),
      ) +
      row(
        "Temperature",
        "",
        segmentedConfig("tempUnit", [
          ["C", "°C"],
          ["F", "°F"],
        ]),
      ) +
      row(
        "Wind speed",
        "",
        segmentedConfig("windUnit", [
          ["kmh", "km/h"],
          ["mph", "mph"],
        ]),
      ) +
      row(
        "Weather alerts",
        "Show storm, heavy-rain and heat warnings under notifications.",
        toggle("wxAlerts"),
      ),
  );
}

function plantationSection() {
  const [lng, lat] = state.geo.c;
  return box(
    "Plantation",
    "Owner-only. These values drive the forecast and weather alerts.",
    row(
      "Plantation name",
      "Shown in the sidebar and on the dashboard.",
      `<input data-c="plantName" value="${esc(
        config.plantName,
      )}" maxlength="40" aria-label="Plantation name">`,
    ) +
      row(
        "Loss per dead tree (Rp)",
        "Added to cash shortfall when predicting next month's loss.",
        `<input type="number" min="0" step="1000" data-c="loss" data-n="1" value="${config.loss}" aria-label="Loss per dead tree">`,
      ) +
      row(
        "Heavy-rain alert (mm / 3 days)",
        "Warn about waterlogging above this rainfall.",
        `<input type="number" min="1" data-c="rainMm" data-n="1" value="${config.rainMm}" aria-label="Rain threshold">`,
      ) +
      row(
        "Heat alert (°C)",
        "Warn about dry stress when the daily high reaches this.",
        `<input type="number" min="20" max="50" data-c="hotC" data-n="1" value="${config.hotC}" aria-label="Heat threshold">`,
      ) +
      row(
        "Plantation location",
        `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        `<button class="btn ghost sm" data-a="go" data-i="map">${ic(
          "map-pin",
        )}Move on map</button>`,
      ),
  );
}

function securitySection() {
  return (
    box(
      "Change password",
      "Use at least 6 characters.",
      `<form id="pwf" class="col" novalidate><div class="fgrid"><label class="fld">Current password<input type="password" id="pw0" autocomplete="current-password"></label><label class="fld">New password<input type="password" id="pw1" autocomplete="new-password"></label><label class="fld">Confirm new password<input type="password" id="pw2" autocomplete="new-password"></label></div><p class="err" id="pwe"></p><div class="row"><button class="btn" type="button" data-a="pwsave">Update password</button></div></form>`,
    ) +
    box(
      "Session",
      "",
      row(
        "Stay signed in",
        "Remember you on this device after closing the tab.",
        toggle("keep"),
      ) +
        row(
          "Auto sign-out",
          "Sign out after a period of no activity.",
          configSelect(
            "autoLogout",
            [
              [0, "Never"],
              [15, "After 15 minutes"],
              [30, "After 30 minutes"],
              [60, "After 1 hour"],
            ],
            true,
          ),
        ) +
        row(
          "This device",
          "Signed in as " + esc(auth.current.username),
          `<button class="btn ghost" data-a="out">${ic("log-out")}Sign out</button>`,
        ),
    )
  );
}

function dataSection() {
  const kilobytes = Math.max(1, Math.round(JSON.stringify(state).length / 1024));
  const exportButtons = [
    ["plants", "Plants"],
    ["tx", "Transactions"],
    ["lap", "Financial reports"],
    ["dead", "Mortality reports"],
    ...(auth.isOwner() ? [["log", "Audit trail"]] : []),
  ];

  return (
    box(
      "Backup & restore",
      `Data lives in this browser (${kilobytes} KB). Back it up regularly.`,
      row(
        "Download backup",
        "Everything: plants, transactions, reports, users, map and audit trail.",
        `<button class="btn" data-a="bkp">${ic("download")}Download .json</button>`,
      ) +
        row(
          "Restore from backup",
          "Replaces all current data with the file you choose.",
          `<button class="btn ghost" data-a="bkr">${ic(
            "upload",
          )}Choose file</button><input type="file" id="bf" accept="application/json,.json" hidden>`,
        ),
    ) +
    box(
      "Export tables",
      "Open in Excel or Google Sheets.",
      `<div class="row">${exportButtons
        .map(
          ([id, label]) =>
            `<button class="btn ghost" data-a="exp" data-i="${id}">${ic(
              "download",
            )}${label}</button>`,
        )
        .join("")}</div>`,
    ) +
    (auth.isOwner()
      ? `<div class="dz"><h3>Danger zone</h3>${row(
          "Clear audit trail",
          "Removes the history of who changed what.",
          `<button class="btn danger" data-a="logc">Clear</button>`,
        )}${row(
          "Reset to demo data",
          "Erases everything saved in this browser and restores the sample plantation.",
          `<button class="btn danger" data-a="rst">Reset</button>`,
        )}</div>`
      : "") +
    box(
      "Cache",
      "",
      row(
        "Weather cache",
        "Forget the saved forecast and fetch a fresh one.",
        `<button class="btn ghost" data-a="wxc">${ic("refresh-cw")}Clear</button>`,
      ),
    )
  );
}

function aboutSection() {
  return (
    box(
      "Keyboard shortcuts",
      "",
      `<div class="shortcuts">${shortcut(
        ["Ctrl", "K"],
        "Search and commands",
      )}${shortcut(["/"], "Search and commands")}${shortcut(
        ["G", "H"],
        "Go to Home",
      )}${shortcut(["G", "P"], "Go to Plants")}${shortcut(
        ["G", "M"],
        "Go to Map",
      )}${shortcut(["G", "I"], "Go to Inventory")}${shortcut(
        ["G", "R"],
        "Go to Reports",
      )}${shortcut(["G", "S"], "Go to Settings")}${shortcut(
        ["Esc"],
        "Close dialogs and menus",
      )}</div>`,
    ) +
    box(
      "About",
      "",
      `<dl class="kv"><dt>App</dt><dd>Sengonis plantation manager, version 2.0</dd><dt>Map</dt><dd>MapLibre GL · OpenFreeMap · OpenStreetMap contributors</dd><dt>Weather</dt><dd>Open-Meteo</dd><dt>Forecast</dt><dd>Random Forest regression running in your browser</dd><dt>Storage</dt><dd>Browser localStorage. Passwords are stored in plain text in this demo, so do not reuse real ones.</dd></dl>`,
    )
  );
}

export function settingsPage() {
  const sections = settingsSections();
  if (!sections.some((section) => section[0] === ui.settingsSection)) {
    ui.settingsSection = "profile";
  }

  const builders = {
    profile: profileSection,
    appearance: appearanceSection,
    prefs: preferencesSection,
    plantation: plantationSection,
    security: securitySection,
    data: dataSection,
    about: aboutSection,
  };
  const body = builders[ui.settingsSection]();

  return (
    pageHead(
      "settings",
      "Settings",
      "Personalise the app, manage your account and look after your data.",
    ) +
    `<div class="setgrid"><nav class="setnav" aria-label="Settings sections">${sections
      .map(
        (section) =>
          `<button data-a="set" data-i="${section[0]}" aria-current="${
            ui.settingsSection === section[0]
          }">${ic(section[2])}${section[1]}</button>`,
      )
      .join("")}</nav><div class="sgrp">${body}</div></div>`
  );
}
