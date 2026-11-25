/* Declarative field definitions used by the modal form builder. */

import { CAUSES, STATUSES, TRANSACTION_TYPES } from "../core/config.js";

export const numberField = (key, label, integer) => ({
  k: key,
  l: label,
  t: "number",
  int: integer,
});

export const plantFields = [
  { k: "tgl", l: "Planting date", t: "date" },
  numberField("tinggi", "Height (m)"),
  numberField("dia", "Diameter (cm)"),
  numberField("blok", "Block", 1),
  { k: "st", l: "Growth status", o: STATUSES },
];

export const transactionFields = [
  { k: "tgl", l: "Transaction date", t: "date" },
  { k: "jenis", l: "Type", o: TRANSACTION_TYPES },
  numberField("nominal", "Amount (Rp)"),
  { k: "bayar", l: "Payment", o: ["Paid", "Unpaid"] },
];

export const financialFields = [
  { k: "periode", l: "Period", t: "month" },
  numberField("masuk", "Total income (Rp)"),
  numberField("keluar", "Total expenses (Rp)"),
];

export const mortalityFields = (plants) => [
  { k: "tgl", l: "Date of death", t: "date" },
  {
    k: "tid",
    l: "Plant",
    o: plants.map((plant) => [
      plant.id,
      "Plant " + plant.id + ", Block " + plant.blok,
    ]),
  },
  numberField("jumlah", "Trees dead", 1),
  { k: "penyebab", l: "Cause", o: CAUSES },
];

export const userFields = (withStatus) => [
  { k: "nama", l: "Full name" },
  { k: "username", l: "Username" },
  {
    k: "password",
    l: "Password",
    t: "password",
    min: 6,
    hint: "At least 6 characters.",
  },
  { k: "telp", l: "Phone number" },
  ...(withStatus
    ? [
        {
          k: "aktif",
          l: "Status",
          o: [
            ["1", "Active"],
            ["0", "Inactive"],
          ],
        },
      ]
    : []),
];
