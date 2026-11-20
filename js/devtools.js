/* Small console/debug bridge. The application itself never reads these
   globals; they keep the old developer workflow and the Playwright suites
   working after the move to ES modules. */

import { config } from "./config.js";
import { auth } from "./model/auth.js";
import { state, save } from "./model/store.js";
import { ui } from "./model/ui.js";
import { plants } from "./model/plants.js";
import { monthly, loss, predict } from "./model/forecast.js";
import { navigation, createActions } from "./view/layout.js";
import { settingsSections } from "./view/settings.js";
import { tableState, tables } from "./view/table.js";
import { actions } from "./controller/actions.js";
import { closeAll, closeModal, done } from "./controller/overlays.js";
import { render } from "./controller/router.js";
import {
  getMap,
  isMapReady,
  selectedBlock,
  mapClick,
} from "./controller/map.js";

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
