/* The action table behind every [data-a] button. Each function receives the
   button's data-i value, exactly like the original A object. */

import { CAUSES, config, saveSettings } from "../config.js";
import { $, today } from "../core/utils.js";
import { ic } from "../core/icons.js";
import { auth } from "../model/auth.js";
import {
  load,
  logAction,
  resetStoredData,
  save,
  state,
} from "../model/store.js";
import { initGeo } from "../model/geo.js";
import { plants } from "../model/plants.js";
import { sumsForMonth, transactions } from "../model/finance.js";
import {
  financialReports,
  mortalityReports,
} from "../model/reports.js";
import { users } from "../model/users.js";
import { clearWeatherCache } from "../model/weather.js";
import { ui } from "../model/ui.js";
import {
  financialFields,
  mortalityFields,
  plantFields,
  transactionFields,
  userFields,
} from "../view/fields.js";
import { toast } from "../view/components.js";
import { tableState, exportTableCsv, resetTablePages } from "../view/table.js";
import {
  applyOption,
  changeConfig,
  downloadBackup,
  exportCsv,
  importBackup,
  savePassword,
  saveProfile,
  setPhoto,
  toggleTheme,
} from "./settings.js";
import { confirmAction, closeModal, done, openForm } from "./overlays.js";
import { openPalette, paletteGo } from "./palette.js";
import {
  navigate,
  render,
  showSettingsSection,
  showTab,
} from "./router.js";
import { logout, sessionView } from "./session.js";
import { mapActions, whenReady } from "./map.js";
import { refreshWeather } from "./weather.js";
import { rememberAction } from "./action-context.js";

function editPlant(id) {
  const plant = plants.byId(id);
  if (!plant) return;

  openForm("Edit plant " + id, plantFields, plant, (data) => {
    plants.update(id, data);
    done();
  });
}

function editTransaction(id) {
  const row = transactions.byId(id);
  if (!row) return;

  openForm("Edit transaction", transactionFields, row, (data) => {
    transactions.update(id, data);
    done();
  });
}

function editFinancialReport(id) {
  const report = financialReports.byId(id);
  if (!report) return;

  openForm("Edit financial report", financialFields, report, (data) => {
    financialReports.update(id, data);
    done();
  });
}

function editMortalityReport(id) {
  const report = mortalityReports.byId(id);
  if (!report) return;

  openForm("Edit mortality report", mortalityFields(state.tan), report, (data) => {
    mortalityReports.update(id, data);
    done();
  });
}

function editUser(id) {
  const user = users.byId(id);
  if (!user) return;

  openForm(
    "Edit user",
    userFields(true),
    { ...user, aktif: user.aktif ? "1" : "0" },
    (data) => {
      if (users.usernameTaken(data.username, user.id)) {
        return "That username is taken.";
      }
      users.update(id, data);
      done();
    },
  );
}

export const actions = {
  close: () => closeModal(),

  /* Navigation and shell */
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
    popover.hidden = wasHidden;
  },
  pal: () => openPalette((name, argument) => actions[name]?.(argument)),
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
    navigate(view);
    ui.query = query;
    render();
  },
  cblk: () => {
    navigate("map");
    whenReady(() => mapActions.bka());
  },

  /* Tables */
  sort: (value) => {
    const [id, key] = String(value).split("|");
    const table = (tableState[id] ??= { k: null, d: 1, p: 1 });
    if (table.k === key) table.d = -table.d;
    else {
      table.k = key;
      table.d = 1;
    }
    ui.animate = false;
    render();
  },
  pg: (value) => {
    const [id, page] = String(value).split("|");
    if (tableState[id]) tableState[id].p = +page;
    ui.animate = false;
    render();
  },
  csv: (id) => exportTableCsv(id),
  print: () => window.print(),

  /* Session and account */
  out: () => {
    logout();
    render();
  },
  demo: (role) => {
    const form = $("#lf");
    if (!form) return;
    form.querySelector('[name="u"]').value = role;
    form.querySelector('[name="p"]').value = role + "123";
    form.querySelector('[name="p"]').focus();
  },
  eye: () => {
    const field = $("#lf [name=p]");
    const button = $("#lf .pwf button");
    if (!field || !button) return;

    const hidden = field.type === "password";
    field.type = hidden ? "text" : "password";
    button.innerHTML = ic(hidden ? "eye-off" : "eye");
  },
  photo: () => $("#pf")?.click(),
  photox: () => {
    delete auth.current.foto;
    save();
    render();
  },
  profsave: () => saveProfile(),
  pwsave: () => savePassword(),

  /* Settings, backup and data */
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

  /* Plants */
  pa: () => {
    openForm(
      "Add plant",
      plantFields,
      {
        tgl: today(),
        tinggi: 0,
        dia: 0,
        blok: plants.blocks()[0] || 1,
        st: "Seedling",
      },
      (data) => {
        plants.add(data);
        done();
      },
    );
  },
  pe: (id) => editPlant(id),
  pd: (id) =>
    confirmAction(
      "Delete this plant record?",
      () => plants.remove(id),
      "Delete",
      true,
    ),

  /* Transactions */
  fa: () => {
    openForm(
      "Add transaction",
      transactionFields,
      { tgl: today(), jenis: "Operations", nominal: 0, bayar: "Paid" },
      (data) => {
        transactions.add(data);
        done();
      },
    );
  },
  fe: (id) => editTransaction(id),
  fv: (id) =>
    confirmAction(
      "Validate this transaction?",
      () => transactions.setStatus(id, "Validated"),
      "Validate",
    ),
  fr: (id) =>
    confirmAction(
      "Reject this transaction?",
      () => transactions.setStatus(id, "Rejected"),
      "Reject",
      true,
    ),

  /* Financial reports */
  la: () => {
    const period = today().slice(0, 7);
    const [income, expenses] = sumsForMonth(state.fin, period);

    openForm(
      "New financial report",
      financialFields,
      { periode: period, masuk: income, keluar: expenses },
      (data) => {
        financialReports.add(data);
        done();
      },
    );
  },
  le: (id) => editFinancialReport(id),
  lv: (id) =>
    confirmAction(
      "Verify this report?",
      () => financialReports.setStatus(id, "Verified"),
      "Verify",
    ),
  lz: (id) =>
    confirmAction(
      "Archive this report?",
      () => financialReports.archive(id),
      "Archive",
    ),

  /* Mortality reports */
  da: () => {
    openForm(
      "New mortality report",
      mortalityFields(state.tan),
      {
        tgl: today(),
        tid: state.tan[0] ? state.tan[0].id : 1,
        jumlah: 1,
        penyebab: CAUSES[0],
      },
      (data) => {
        mortalityReports.add(data);
        done();
      },
    );
  },
  de: (id) => editMortalityReport(id),
  dv: (id) =>
    confirmAction(
      "Verify this report?",
      () => mortalityReports.setStatus(id, "Verified"),
      "Verify",
    ),
  dz: (id) =>
    confirmAction(
      "Archive this report?",
      () => mortalityReports.archive(id),
      "Archive",
    ),

  /* Users */
  ua: () => {
    openForm("Add field officer", userFields(false), {}, (data) => {
      if (users.usernameTaken(data.username)) return "That username is taken.";
      users.add(data);
      done();
    });
  },
  ue: (id) => editUser(id),
  ud: (id) =>
    confirmAction(
      "Deactivate this account?",
      () => users.setActive(id, false),
      "Deactivate",
      true,
    ),
  ur: (id) =>
    confirmAction(
      "Reactivate this account?",
      () => users.setActive(id, true),
      "Reactivate",
    ),

  ...mapActions,
};

/* Used by the event layer so a click can be logged with its label. */
export function runAction(name, argument) {
  const action = actions[name];
  if (!action) return;
  rememberAction(name, argument);
  action(argument);
}
