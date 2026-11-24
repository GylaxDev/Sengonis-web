/* Settings, backup, data reset and weather cache actions. */

import { $ } from "../../core/utils.js";
import { auth } from "../auth.js";
import { load, resetStoredData, state } from "../store.js";
import { initGeo } from "../geo.js";
import { ui } from "../ui.js";
import { clearWeatherCache } from "../weather-data.js";
import { toast } from "../../views/components.js";
import {
  applyOption,
  downloadBackup,
  exportCsv,
  toggleTheme,
} from "../settings.js";
import { confirmAction } from "../overlays.js";
import { render } from "../router.js";
import { logout, sessionView } from "../session.js";
import { refreshWeather } from "../weather.js";

export const preferenceActions = {
  cfg: (value) => applyOption(value),
  theme2: () => toggleTheme(),
  bkp: () => downloadBackup(),
  bkr: () => $("#bf")?.click(),
  exp: (id) => exportCsv(id),
  logc: () =>
    confirmAction(
      "Clear the whole audit trail? This cannot be undone.",
      () => {
        state.log = [];
      },
      "Clear",
      true,
    ),
  wxc: () => {
    clearWeatherCache();
    refreshWeather({ force: true });
    toast("Weather cache cleared");
  },
  rst: () =>
    confirmAction(
      "Reset everything to the demo data? This erases the plants, transactions, reports and users saved in this browser.",
      () => {
        resetStoredData();
        load();
        initGeo();
        sessionView.error = "";
        auth.current = null;
        logout();
        ui.animate = true;
      },
      "Reset",
      true,
    ),
  wxr: () => refreshWeather({ force: true }),
};
