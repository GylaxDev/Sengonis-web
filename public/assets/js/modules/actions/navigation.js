/* Navigation, shell and shared UI state actions. */

import { config, saveSettings } from "../../core/config.js";
import { $ } from "../../core/utils.js";
import { ui } from "../ui.js";
import { resetTablePages } from "../../views/table.js";
import { paletteGo } from "../palette.js";
import {
  navigate,
  render,
  showSettingsSection,
  showTab,
} from "../router.js";
import { mapActions, whenReady } from "../map.js";
import { closeModal } from "../overlays.js";

export const navigationActions = {
  close: () => closeModal(),

  go: (view) => navigate(view),
  tab: (tab) => showTab(tab),
  set: (section) => showSettingsSection(section),
  nav: () => {
    const shell = $(".shell");
    if (!shell) return;

    if (innerWidth <= 900) {
      shell.classList.toggle("open");
      return;
    }

    shell.classList.toggle("sbm");
    config.sidebar = shell.classList.contains("sbm") ? "mini" : "full";
    saveSettings();
  },
  pop: (id) => {
    const popover = $("#" + id);
    if (!popover) return;
    const wasHidden = popover.hidden;
    document.querySelectorAll(".pop").forEach((element) => {
      element.hidden = true;
    });
    popover.hidden = !wasHidden;
  },
  palgo: (index) => paletteGo(index),
  per: (period) => {
    ui.period = +period;
    ui.animate = false;
    render();
  },
  ift: (type) => {
    ui.inventoryType = type;
    resetTablePages();
    ui.animate = false;
    render();
  },
  pinv: () => {
    ui.inventoryStatus = "Pending validation";
    ui.inventoryType = "all";
    navigate("inventory");
  },
  plap: () => {
    ui.tab = "fin";
    ui.showArchived = false;
    navigate("reports");
  },
  pmor: () => {
    ui.tab = "dead";
    ui.showArchived = false;
    navigate("reports");
  },
  srch: (value) => {
    const [view, query] = String(value).split("|");
    navigate(view, query || "");
  },
  cblk: () => {
    navigate("map");
    whenReady(() => mapActions.bka());
  },
  print: () => window.print(),
};
