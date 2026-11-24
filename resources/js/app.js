/* Application entry point: load settings and data, restore the session,
   connect the global listeners and draw the first screen. */

import { config, loadSettings } from "./core/config.js";
import { auth, restoreSession } from "./modules/auth.js";
import { initGeo } from "./modules/geo.js";
import { load } from "./modules/store.js";
import { ui } from "./modules/ui.js";
import { applyTheme } from "./views/theme.js";
import { closeAll } from "./modules/overlays.js";
import { logout, sessionView } from "./modules/session.js";
import { idleFor, touch } from "./modules/activity.js";
import { mountMap } from "./modules/map.js";
import {
  installRouting,
  onRendered,
  readRoute,
  render,
} from "./modules/router.js";
import { installEvents } from "./modules/events.js";
import { installDevtools } from "./core/devtools.js";

loadSettings();
applyTheme();

load();
initGeo();
restoreSession();

ui.period = config.period;
ui.view =
  config.landing === "users" && !auth.isOwner() ? "home" : config.landing;
readRoute();

touch();
onRendered((view) => {
  if (view === "map") mountMap();
});
installEvents();
installRouting();
installDevtools();

setInterval(() => {
  if (!auth.current || !config.autoLogout) return;
  if (idleFor() <= config.autoLogout * 60000) return;

  sessionView.error =
    "You were signed out after " +
    config.autoLogout +
    " minutes of inactivity.";
  logout();
  closeAll();
  render();
}, 15000);

matchMedia("(prefers-color-scheme:dark)").addEventListener?.("change", () => {
  applyTheme();
  if (auth.current && config.theme === "system") render();
});

render();
