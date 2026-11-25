/* Small console/debug bridge. The application itself never reads these
   globals; they keep the old developer workflow and the Playwright suites
   working after the move to ES modules. */

import { config } from "./config.js";
import { auth } from "../modules/auth.js";
import { state, save } from "../modules/store.js";
import { ui } from "../modules/ui.js";
import { plants } from "../modules/plants.js";
import { monthly, loss, predict } from "../modules/forecast.js";
import { navigation, createActions } from "../views/layout.js";
import { settingsSections } from "../views/settings.js";
import { tableState, tables } from "../views/table.js";
import { actions } from "../modules/actions/index.js";
import { closeAll, closeModal, done } from "../modules/overlays.js";
import { render } from "../modules/router.js";
import {
  getMap,
  isMapReady,
  selectedBlock,
  mapClick,
} from "../modules/map.js";

export function installDevtools() {
  window.A = actions;
  window.CFG = config;
  window.TB = tables;
  window.TS = tableState;

  window.byId = (rows, id) => rows.find((row) => row.id == id);
  window.blocks = () => plants.blocks();
  window.monthly = monthly;
  window.loss = loss;
  window.predict = predict;
  window.NAVS = navigation;
  window.CRE = createActions;
  window.SECS = settingsSections;
  window.close = closeModal;
  window.closeAll = closeAll;
  window.done = done;
  window.render = render;
  window.save = save;
  window.mapClick = mapClick;

  const getters = {
    S: () => state,
    U: () => auth.current,
    V: () => ui.view,
    P: () => ui.period,
    TAB: () => ui.tab,
    ARCH: () => ui.showArchived,
    Q: () => ui.query,
    MAP: () => getMap(),
    MR: () => isMapReady(),
    MB: () => selectedBlock(),
  };

  Object.entries(getters).forEach(([name, get]) => {
    Object.defineProperty(window, name, {
      get,
      configurable: true,
    });
  });
}
