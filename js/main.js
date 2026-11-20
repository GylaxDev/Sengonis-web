/* Application entry point: load settings and data, restore the session,
   connect the global listeners and draw the first screen. */

import { config, loadSettings } from "./config.js";
import { auth, restoreSession } from "./model/auth.js";
import { initGeo } from "./model/geo.js";
import { load } from "./model/store.js";
import { ui } from "./model/ui.js";
import { applyTheme } from "./view/theme.js";
import { closeAll } from "./controller/overlays.js";
import { logout, sessionView } from "./controller/session.js";
import { idleFor, touch } from "./controller/activity.js";
import { mountMap } from "./controller/map.js";
import { onRendered, render } from "./controller/router.js";
import { installEvents } from "./controller/events.js";
import { installDevtools } from "./devtools.js";

loadSettings();
applyTheme();

load();
initGeo();
restoreSession();

ui.period = config.period;
ui.view =
  config.landing === "users" && !auth.isOwner() ? "home" : config.landing;

touch();
onRendered((view) => {
  if (view === "map") mountMap();
});
installEvents();
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
