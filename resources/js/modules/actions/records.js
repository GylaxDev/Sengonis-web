/* Create / edit / review actions for plants, transactions, reports and users. */

import { CAUSES } from "../../core/config.js";
import { today } from "../../core/utils.js";
import { state } from "../store.js";
import { plants } from "../plants.js";
import { sumsForMonth, transactions } from "../finance.js";
import { financialReports, mortalityReports } from "../reports.js";
import { users } from "../users.js";
import {
  financialFields,
  mortalityFields,
  plantFields,
  transactionFields,
  userFields,
} from "../../views/fields.js";
import { confirmAction, done, openForm } from "../overlays.js";

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

export const recordActions = {
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
};
