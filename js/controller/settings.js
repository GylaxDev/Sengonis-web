/* Settings actions: config changes, profile, password, backup and exports. */

import { DEFAULTS, config, saveSettings } from "../config.js";
import { $, download, toCSV, today } from "../core/utils.js";
import { auth, writeSession } from "../model/auth.js";
import {
  logAction,
  replaceState,
  save,
  state,
} from "../model/store.js";
import { initGeo } from "../model/geo.js";
import { ui } from "../model/ui.js";
import { CSV_EXPORTS, createBackup, parseBackup } from "../model/backup.js";
import { toast } from "../view/components.js";
import { applyTheme } from "../view/theme.js";
import { touch } from "./activity.js";
import { confirmAction } from "./overlays.js";
import { render } from "./router.js";

export function notifyConfigChanged(key) {
  if (key === "keep") writeSession(auth.current);
  if (key === "period") ui.period = config.period;
  touch();
}

/* data-a="cfg" values look like "theme|dark". */
export function applyOption(value) {
  const [key, raw] = value.split("|");
  config[key] = /^\d+$/.test(raw) ? +raw : raw;
  saveSettings();
  applyTheme();
  notifyConfigChanged(key);
  ui.animate = false;
  render();
}

export function toggleTheme() {
  const dark =
    config.theme === "dark" ||
    (config.theme === "system" &&
      matchMedia("(prefers-color-scheme:dark)").matches);
  config.theme = dark ? "light" : "dark";
  saveSettings();
  applyTheme();
  ui.animate = false;
  render();
}

export function saveProfile() {
  const name = $("#pn").value.trim();
  const phone = $("#pt").value.trim();
  const error = $("#pfe");

  if (!name) {
    error.textContent = "Name is required.";
    return;
  }
  if (!/^[+\d][\d\s-]{5,}$/.test(phone)) {
    error.textContent = "Enter a valid phone number.";
    return;
  }

  auth.current.nama = name;
  auth.current.telp = phone;
  logAction("Updated own profile", auth.current);
  save();
  render();
  toast("Profile saved");
}

export function savePassword() {
  const current = $("#pw0").value;
  const next = $("#pw1").value;
  const confirmation = $("#pw2").value;
  const error = $("#pwe");

  if (current !== auth.current.password) {
    error.textContent = "Current password is incorrect.";
    return;
  }
  if (next.length < 6) {
    error.textContent = "New password must be at least 6 characters.";
    return;
  }
  if (next !== confirmation) {
    error.textContent = "The new passwords do not match.";
    return;
  }
  if (next === current) {
    error.textContent = "Choose a password you have not used just now.";
    return;
  }

  auth.current.password = next;
  logAction("Changed own password", auth.current);
  save();
  render();
  toast("Password updated");
}

export function setPhoto(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      canvas
        .getContext("2d")
        .drawImage(
          image,
          (image.width - side) / 2,
          (image.height - side) / 2,
          side,
          side,
          0,
          0,
          256,
          256,
        );
      auth.current.foto = canvas.toDataURL("image/jpeg", 0.85);
      save();
      render();
      toast("Photo updated");
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

export function downloadBackup() {
  download(
    `sengonis-backup-${today()}.json`,
    JSON.stringify(createBackup(), null, 1),
    "application/json",
  );
  toast("Backup downloaded");
}

export function importBackup(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = parseBackup(reader.result);
      confirmAction(
        `Replace all current data with this backup (${data.tan.length} plants, ${data.fin.length} transactions, ${data.users.length} users)?`,
        () => {
          replaceState(data);
          initGeo();
          save();

          const current = data.users.find(
            (user) => user.id == (auth.current && auth.current.id),
          );
          if (current) {
            auth.current = current;
          } else {
            auth.current = null;
            writeSession(null);
          }
        },
        "Restore",
        true,
      );
    } catch (error) {
      toast("That file is not a valid Sengonis backup.", "bad");
    }
  };
  reader.readAsText(file);
}

export function exportCsv(id) {
  const [name, head, rows] = CSV_EXPORTS[id]();
  download(`sengonis-${name}-${today()}.csv`, toCSV(head, rows), "text/csv");
  toast("Exported " + rows.length + " rows");
}

/* Used by the change handler for settings inputs and selects. */
export function changeConfig(key, value) {
  if (key === "plantName" && !String(value).trim()) {
    value = DEFAULTS.plantName;
  }
  config[key] = typeof value === "string" ? value.trim() : value;
  saveSettings();
  applyTheme();
  notifyConfigChanged(key);
  ui.animate = false;
  render();
  toast("Setting saved");
}

export { DEFAULTS };
