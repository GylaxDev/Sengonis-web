/* Transactions and monthly validated totals. */

import { state } from "./store.js";
import { nextId } from "../core/utils.js";

export const transactions = {
  all() {
    return state.fin;
  },

  byId(id) {
    return state.fin.find((row) => row.id == id);
  },

  add(data) {
    const row = {
      id: nextId(state.fin),
      ...data,
      status: "Pending validation",
    };
    state.fin.push(row);
    return row;
  },

  update(id, data) {
    const row = this.byId(id);
    if (row) Object.assign(row, data);
    return row;
  },

  setStatus(id, status) {
    const row = this.byId(id);
    if (row) row.status = status;
    return row;
  },
};

/* [income, expenses] for one YYYY-MM month, validated rows only. */
export function sumsForMonth(rows, yearMonth) {
  let income = 0;
  let expenses = 0;
  rows
    .filter((row) => row.status === "Validated" && row.tgl.startsWith(yearMonth))
    .forEach((row) => {
      if (row.jenis === "Sale") income += row.nominal;
      else expenses += row.nominal;
    });
  return [income, expenses];
}
