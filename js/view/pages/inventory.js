/* Inventory: seedling purchases, operating costs and sales. */

import { TRANSACTION_TYPES } from "../../core/config.js";
import { formatDate, money, moneyShort } from "../../core/utils.js";
import { ic } from "../../core/icons.js";
import { auth } from "../../model/auth.js";
import { state } from "../../model/store.js";
import { ui } from "../../model/ui.js";
import { btn, exportButton, pageHead, pill, searchField, selectBox } from "../components.js";
import { dataTable } from "../table.js";

const matchesQuery = (row) =>
  !ui.query ||
  [row.tgl, row.jenis, row.bayar, row.status, row.nominal]
    .join(" ")
    .toLowerCase()
    .includes(ui.query.toLowerCase());

export function inventoryPage() {
  const validated = state.fin.filter((row) => row.status === "Validated");
  const income = validated
    .filter((row) => row.jenis === "Sale")
    .reduce((sum, row) => sum + row.nominal, 0);
  const expenses = validated.reduce(
    (sum, row) => sum + (row.jenis === "Sale" ? 0 : row.nominal),
    0,
  );
  const pending = state.fin
    .filter((row) => row.status === "Pending validation")
    .reduce((sum, row) => sum + row.nominal, 0);
  const unpaid = state.fin
    .filter(
      (row) =>
        row.jenis === "Sale" &&
        row.bayar === "Unpaid" &&
        row.status !== "Rejected",
    )
    .reduce((sum, row) => sum + row.nominal, 0);

  const rows = state.fin.filter(
    (row) =>
      (ui.inventoryType === "all" || row.jenis === ui.inventoryType) &&
      (ui.inventoryStatus === "all" || row.status === ui.inventoryStatus) &&
      matchesQuery(row),
  );

  const columns = [
    { k: "tgl", l: "Date", h: (row) => formatDate(row.tgl) },
    { k: "jenis", l: "Type" },
    {
      k: "nominal",
      l: "Amount",
      v: (row) => row.nominal,
      h: (row) => money(row.nominal),
      r: 1,
    },
    { k: "bayar", l: "Payment", h: (row) => pill(row.bayar) },
    { k: "status", l: "Status", h: (row) => pill(row.status) },
  ];

  const categories = [
    ["all", "All transactions", "list"],
    ["Seedling purchase", "Seedling purchases", "sprout"],
    ["Operations", "Operations", "wrench"],
    ["Sale", "Sales", "banknote"],
  ];

  return (
    pageHead(
      "box",
      "Inventory",
      "Seedling purchases, operating costs and sales. Field officers enter drafts; the owner validates them.",
      auth.isOwner()
        ? ""
        : `<button class="btn" data-a="fa">${ic("plus")}Add transaction</button>`,
    ) +
    `<div class="gs"><div class="stat"><span class="l">Validated income</span><b class="pos">${moneyShort(
      income,
    )}</b><i class="tic">${ic(
      "banknote",
    )}</i></div><div class="stat"><span class="l">Validated expenses</span><b>${moneyShort(
      expenses,
    )}</b><i class="tic">${ic(
      "wallet",
    )}</i></div><div class="stat"><span class="l">Pending validation</span><b>${moneyShort(
      pending,
    )}</b><i class="tic">${ic(
      "clock",
    )}</i></div><div class="stat"><span class="l">Unpaid sales</span><b>${moneyShort(
      unpaid,
    )}</b><i class="tic">${ic("hourglass")}</i></div></div>` +
    `<div class="cats">${categories
      .map((category) => {
        const count = state.fin.filter(
          (row) => category[0] === "all" || row.jenis === category[0],
        ).length;
        return `<button class="cat" data-a="ift" data-i="${
          category[0]
        }" aria-pressed="${ui.inventoryType === category[0]}"><span><b>${
          category[1]
        }</b><small>${count} entries</small></span>${ic(
          category[2],
        )}</button>`;
      })
      .join("")}</div>` +
    `<div class="tools"><div class="row">${searchField(
      ui.query,
      "Search transactions",
    )}${selectBox(ui.inventoryStatus, "IS", [
      ["all", "All statuses"],
      "Pending validation",
      "Validated",
      "Rejected",
    ])}</div><div class="row">${exportButton("inventory")}</div></div>` +
    dataTable("inventory", columns, rows, {
      name: "transactions",
      icon: "receipt",
      empty: "No transactions match.",
      filtered:
        !!ui.query ||
        ui.inventoryType !== "all" ||
        ui.inventoryStatus !== "all",
      act: (row) => {
        const isPending = row.status === "Pending validation";
        if (auth.isOwner() && isPending) {
          return (
            btn("fv", row.id, "Validate") + btn("fr", row.id, "Reject", "ghost")
          );
        }
        if (!auth.isOwner() && isPending) {
          return btn("fe", row.id, "Edit", "ghost");
        }
        return "";
      },
    })
  );
}
