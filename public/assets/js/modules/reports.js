/* Financial and mortality reports, plus the pending-work counters used by
   the sidebar, notifications and dashboard. */

import { state } from "./store.js";
import { nextId } from "../core/utils.js";

export const financialReports = {
  all() {
    return state.lap;
  },

  byId(id) {
    return state.lap.find((report) => report.id == id);
  },

  add(data) {
    const report = {
      id: nextId(state.lap),
      ...data,
      status: "Draft",
      arsip: false,
    };
    state.lap.push(report);
    return report;
  },

  update(id, data) {
    const report = this.byId(id);
    if (report) Object.assign(report, data);
    return report;
  },

  setStatus(id, status) {
    const report = this.byId(id);
    if (report) report.status = status;
    return report;
  },

  archive(id) {
    const report = this.byId(id);
    if (report) report.arsip = true;
    return report;
  },
};

export const mortalityReports = {
  all() {
    return state.dead;
  },

  byId(id) {
    return state.dead.find((report) => report.id == id);
  },

  add(data) {
    const report = {
      id: nextId(state.dead),
      ...data,
      tid: +data.tid,
      status: "Draft",
      arsip: false,
    };
    state.dead.push(report);
    return report;
  },

  update(id, data) {
    const report = this.byId(id);
    if (report) Object.assign(report, data, { tid: +data.tid });
    return report;
  },

  setStatus(id, status) {
    const report = this.byId(id);
    if (report) report.status = status;
    return report;
  },

  archive(id) {
    const report = this.byId(id);
    if (report) report.arsip = true;
    return report;
  },
};

export function pendingCounts() {
  return {
    transactions: state.fin.filter(
      (row) => row.status === "Pending validation",
    ).length,
    financial: state.lap.filter(
      (report) => report.status === "Draft" && !report.arsip,
    ).length,
    mortality: state.dead.filter(
      (report) => report.status === "Draft" && !report.arsip,
    ).length,
  };
}

/* Total dead trees per cause, across every report (the original behaviour). */
export function deathsByCause() {
  const totals = {};
  state.dead.forEach((report) => {
    totals[report.penyebab] = (totals[report.penyebab] || 0) + report.jumlah;
  });
  return totals;
}
