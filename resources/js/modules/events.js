/* Global input plumbing: click delegation, search, settings changes,
   keyboard shortcuts and a few form safeguards. */

import { DEFAULTS } from "../core/config.js";
import { $, $$ } from "../core/utils.js";
import { auth } from "./auth.js";
import { ui } from "./ui.js";
import { toast } from "../views/components.js";
import { resetTablePages } from "../views/table.js";
import { actions, runAction } from "./actions/index.js";
import { closeAll, closeModal } from "./overlays.js";
import {
  closePalette,
  isPaletteOpen,
  openPalette,
} from "./palette.js";
import { render } from "./router.js";
import { touch } from "./activity.js";
import {
  changeConfig,
  importBackup,
  setPhoto,
} from "./settings.js";

const TABLE_STATE_SETTERS = {
  P: (value) => (ui.period = +value),
  FB: (value) => (ui.plantBlock = value),
  PS: (value) => (ui.plantStatus = value),
  IS: (value) => (ui.inventoryStatus = value),
  ARCH: (value) => (ui.showArchived = value),
  RF: (value) => (ui.reportFrom = value),
  RT: (value) => (ui.reportTo = value),
};

const SHORTCUT_PAGES = {
  h: "home",
  p: "plants",
  m: "map",
  i: "inventory",
  r: "reports",
  s: "settings",
  u: "users",
};

let lastG = 0;

function openCommandPalette() {
  openPalette((name, argument) => actions[name]?.(argument));
}

function handleSearchInput(input) {
  ui.query = input.value;
  resetTablePages();
  render();

  const next = $("[data-q]");
  if (next) {
    next.focus();
    next.setSelectionRange(ui.query.length, ui.query.length);
  }
}

function handleSettingChange(input) {
  const key = input.dataset.c;
  if (!key) return false;

  let value = input.type === "checkbox" ? input.checked : input.value;

  if (input.dataset.n) {
    value = Number(value);
    if (!isFinite(value) || value < 0) {
      toast("Enter a number of 0 or more.", "bad");
      ui.animate = false;
      render();
      return true;
    }
  }

  if (key === "plantName" && !String(value).trim()) {
    value = DEFAULTS.plantName;
  }

  changeConfig(key, value);
  return true;
}

function handleTableState(input) {
  const setter = TABLE_STATE_SETTERS[input.dataset.s];
  if (!setter) return false;

  setter(input.type === "checkbox" ? input.checked : input.value);
  resetTablePages();
  ui.animate = false;
  render();
  return true;
}

function onDocumentClick(event) {
  if (event.target.matches(".mb")) {
    closeAll();
    return;
  }

  if (!event.target.closest(".pop,[data-a=pop]")) {
    $$(".pop").forEach((popover) => {
      popover.hidden = true;
    });
  }

  const button = event.target.closest("[data-a]");
  if (button && actions[button.dataset.a]) {
    runAction(button.dataset.a, button.dataset.i);
  }
}

function onDocumentInput(event) {
  if (event.target.dataset.q != null) handleSearchInput(event.target);
}

function onDocumentChange(event) {
  const input = event.target;

  if (input.id === "pf") {
    setPhoto(input.files[0]);
    return;
  }

  if (input.id === "bf") {
    importBackup(input.files[0]);
    input.value = "";
    return;
  }

  if (handleSettingChange(input)) return;
  handleTableState(input);
}

function onDocumentKeydown(event) {
  if (!auth.current) return;

  const typing =
    /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) ||
    !!$("#m").innerHTML;

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (isPaletteOpen()) closePalette();
    else openCommandPalette();
    return;
  }

  if (event.key === "Escape") {
    if (isPaletteOpen()) closePalette();
    $$(".pop").forEach((popover) => {
      popover.hidden = true;
    });
    if ($("#m").innerHTML) closeModal();
    return;
  }

  if (typing || event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === "/") {
    event.preventDefault();
    openCommandPalette();
    return;
  }

  if (event.key.toLowerCase() === "g") {
    lastG = Date.now();
    return;
  }

  if (Date.now() - lastG < 900) {
    const page = SHORTCUT_PAGES[event.key.toLowerCase()];
    if (page) {
      lastG = 0;
      runAction("go", page);
    }
  }
}

function onActivity() {
  touch();
}

/* Profile and password forms have their own buttons; keep Enter from
   submitting and reloading the single-page app. */
function onDocumentSubmit(event) {
  if (event.target.matches("#pfm,#pwf")) event.preventDefault();
}

export function installEvents() {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("input", onDocumentInput);
  document.addEventListener("change", onDocumentChange);
  document.addEventListener("keydown", onDocumentKeydown);
  document.addEventListener("submit", onDocumentSubmit);

  ["click", "keydown", "pointerdown", "scroll", "touchstart"].forEach(
    (eventName) =>
      addEventListener(eventName, onActivity, {
        passive: true,
        capture: true,
      }),
  );
}
