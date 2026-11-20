/* The data store: seed data, localStorage persistence and the audit log.
   This module owns the one mutable application state object. */

import { CAUSES, STORAGE } from "../config.js";
import { monthOffset, seededRandom } from "../core/utils.js";

export let state = null;

function validatedTotals(yearMonth) {
  let income = 0;
  let expenses = 0;
  state.fin
    .filter(
      (row) =>
        row.status === "Validated" && row.tgl.startsWith(yearMonth),
    )
    .forEach((row) => {
      if (row.jenis === "Sale") income += row.nominal;
      else expenses += row.nominal;
    });
  return [income, expenses];
}

function seed() {
  const random = seededRandom(11);
  const pick = (values) => values[Math.floor(random() * values.length)];

  const users = [
    {
      id: 1,
      role: "Owner",
      nama: "Bu Siti",
      username: "owner",
      password: "owner123",
      telp: "081234567890",
      aktif: true,
    },
    {
      id: 2,
      role: "Field Officer",
      nama: "Andi Pratama",
      username: "officer",
      password: "officer123",
      telp: "081298765432",
      aktif: true,
    },
  ];

  const tan = [];
  for (let id = 1; id <= 36; id++) {
    const st = pick(["Seedling", "Growing", "Growing", "Mature", "Dead"]);
    const age = { Seedling: 2, Growing: 8, Mature: 14, Dead: 6 }[st];
    tan.push({
      id,
      tgl: monthOffset(age),
      tinggi: +(age * 0.5 + random()).toFixed(1),
      dia: +(age * 0.9 + random() * 2).toFixed(1),
      blok: 1 + (id % 4),
      st,
    });
  }

  const fin = [];
  const dead = [];
  const lap = [];
  let nextTransactionId = 0;

  for (let k = 11; k >= 0; k--) {
    const status = k > 0 ? "Validated" : "Pending validation";

    fin.push({
      id: ++nextTransactionId,
      tgl: monthOffset(k, 5),
      jenis: "Seedling purchase",
      nominal: Math.round((k % 3 ? 1.2 : 6) * 1e6 + random() * 1e6),
      bayar: "Paid",
      status: "Validated",
    });

    fin.push({
      id: ++nextTransactionId,
      tgl: monthOffset(k, 12),
      jenis: "Operations",
      nominal: Math.round(1.5e6 + random() * 2e6),
      bayar: "Paid",
      status,
    });

    if (k % 2 === 0 || k === 1) {
      fin.push({
        id: ++nextTransactionId,
        tgl: monthOffset(k, 20),
        jenis: "Sale",
        nominal: Math.round(3e6 + random() * 5e6),
        bayar: pick(["Paid", "Paid", "Unpaid"]),
        status: k > 0 ? "Validated" : "Pending validation",
      });
    }

    dead.push({
      id: 12 - k,
      tgl: monthOffset(k, 18),
      tid: 1 + Math.floor(random() * 36),
      jumlah: 1 + Math.floor(random() * 7),
      penyebab: pick(CAUSES),
      status: k > 0 ? "Verified" : "Draft",
      arsip: k > 9,
    });
  }

  return { users, tan, fin, dead, lap };
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE.data);
    if (raw) {
      state = JSON.parse(raw);
      state.log = state.log || [];
      return state;
    }
  } catch (error) {
    /* A corrupt saved state falls through to a fresh demo dataset. */
  }

  state = seed();
  state.log = [];

  for (let k = 11; k >= 0; k--) {
    const yearMonth = monthOffset(k).slice(0, 7);
    const [income, expenses] = validatedTotals(yearMonth);
    state.lap.push({
      id: 12 - k,
      periode: yearMonth,
      masuk: income,
      keluar: expenses,
      status: k > 0 ? "Verified" : "Draft",
      arsip: k > 9,
    });
  }

  return state;
}

export function save() {
  try {
    localStorage.setItem(STORAGE.data, JSON.stringify(state));
  } catch (error) {
    /* Ignore quota/private-mode failures; the in-memory state is still valid. */
  }
}

export function replaceState(nextState) {
  state = nextState;
  state.log = state.log || [];
}

export function resetStoredData() {
  try {
    localStorage.removeItem(STORAGE.data);
  } catch (error) {
    /* Nothing to do if storage is unavailable. */
  }
}

export function logAction(action, user) {
  if (!state) return;
  state.log.unshift({
    t: new Date().toISOString(),
    u: user ? user.nama : "",
    x: action,
  });
  state.log.length = Math.min(state.log.length, 300);
}
