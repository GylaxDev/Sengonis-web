/* Backup files and the CSV table definitions used by Settings → Export. */

import { state } from "./store.js";

export function createBackup() {
  return {
    app: "sengonis",
    v: 2,
    at: new Date().toISOString(),
    data: state,
  };
}

/* Accepts both { data: {...} } and a bare data object, as before. */
export function parseBackup(text) {
  const parsed = JSON.parse(text);
  const data = parsed.data || parsed;
  const required = ["users", "tan", "fin", "dead", "lap"];
  if (!required.every((key) => Array.isArray(data[key]))) {
    throw new Error("Not a Sengonis backup");
  }
  return data;
}

export const CSV_EXPORTS = {
  plants() {
    return [
      "plants",
      [
        "ID",
        "Planted",
        "Height (m)",
        "Diameter (cm)",
        "Block",
        "Status",
        "Lng",
        "Lat",
      ],
      state.tan.map((plant) => [
        plant.id,
        plant.tgl,
        plant.tinggi,
        plant.dia,
        plant.blok,
        plant.st,
        plant.lng ?? "",
        plant.lat ?? "",
      ]),
    ];
  },

  tx() {
    return [
      "transactions",
      ["Date", "Type", "Amount (Rp)", "Payment", "Status"],
      state.fin.map((row) => [
        row.tgl,
        row.jenis,
        row.nominal,
        row.bayar,
        row.status,
      ]),
    ];
  },

  lap() {
    return [
      "financial-reports",
      [
        "Period",
        "Income (Rp)",
        "Expenses (Rp)",
        "Net (Rp)",
        "Status",
        "Archived",
      ],
      state.lap.map((report) => [
        report.periode,
        report.masuk,
        report.keluar,
        report.masuk - report.keluar,
        report.status,
        report.arsip ? "yes" : "no",
      ]),
    ];
  },

  dead() {
    return [
      "mortality-reports",
      [
        "Date",
        "Plant",
        "Trees dead",
        "Cause",
        "Status",
        "Archived",
      ],
      state.dead.map((report) => [
        report.tgl,
        report.tid,
        report.jumlah,
        report.penyebab,
        report.status,
        report.arsip ? "yes" : "no",
      ]),
    ];
  },

  log() {
    return [
      "audit-trail",
      ["Time", "User", "Action"],
      state.log.map((entry) => [entry.t, entry.u, entry.x]),
    ];
  },

  users() {
    return [
      "users",
      ["Name", "Username", "Role", "Phone", "Status"],
      state.users.map((user) => [
        user.nama,
        user.username,
        user.role,
        user.telp,
        user.aktif ? "Active" : "Inactive",
      ]),
    ];
  },
};
