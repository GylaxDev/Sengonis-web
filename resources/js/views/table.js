/* Generic sortable, paginated data table with CSV export.
   columns: {k, l, v?: row=>raw value, h?: row=>html, r?: right-align}
   options: {name, icon, empty, act?: row=>html, filtered?: boolean} */

import { config } from "../core/config.js";
import { download, esc, today, toCSV } from "../core/utils.js";
import { ic } from "../core/icons.js";
import { toast } from "./components.js";

export const tables = {};
export const tableState = {};

export function resetTablePages() {
  Object.values(tableState).forEach((state) => {
    state.p = 1;
  });
}

export function dataTable(id, columns, rows, options = {}) {
  const state = (tableState[id] ??= { k: null, d: 1, p: 1 });
  let sorted = rows.slice();

  if (state.k) {
    const column = columns.find((candidate) => candidate.k === state.k);
    if (column) {
      const valueOf = column.v || ((row) => row[column.k]);
      sorted.sort((a, b) => {
        const left = valueOf(a);
        const right = valueOf(b);
        const comparison =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right), undefined, {
                numeric: true,
              });
        return comparison * state.d;
      });
    }
  }

  tables[id] = { cols: columns, rows: sorted, name: options.name || id };

  const total = sorted.length;
  const perPage = config.rows || total || 1;
  const pages = Math.max(1, Math.ceil(total / perPage));
  state.p = Math.min(Math.max(1, state.p), pages);

  const from = (state.p - 1) * perPage;
  const page = sorted.slice(from, from + perPage);
  const columnCount = columns.length + (options.act ? 1 : 0);

  const header = (column) => {
    const active = state.k === column.k;
    return `<th class="${column.r ? "r" : ""}" aria-sort="${
      active ? (state.d > 0 ? "ascending" : "descending") : "none"
    }"><button class="th${active ? " on" : ""}" data-a="sort" data-i="${id}|${
      column.k
    }">${column.l}${ic(
      active ? (state.d > 0 ? "chevron-up" : "chevron-down") : "chevrons-up-down",
    )}</button></th>`;
  };

  const body = page
    .map(
      (row, index) =>
        `<tr style="--r:${Math.min(index, 12)}">${columns
          .map(
            (column) =>
              `<td class="${column.r ? "r" : ""}">${
                column.h
                  ? column.h(row)
                  : esc(column.v ? column.v(row) : row[column.k])
              }</td>`,
          )
          .join("")}${
          options.act ? `<td class="a">${options.act(row)}</td>` : ""
        }</tr>`,
    )
    .join("");

  const pageNumbers = () => {
    const numbers = [];
    for (let index = 1; index <= pages; index++) {
      if (
        index === 1 ||
        index === pages ||
        Math.abs(index - state.p) <= 1
      ) {
        numbers.push(index);
      }
    }
    return numbers.flatMap((number, index) =>
      numbers[index - 1] && number - numbers[index - 1] > 1
        ? ["…", number]
        : [number],
    );
  };

  const pager =
    config.rows && pages > 1
      ? `<div class="pg"><span>Showing ${from + 1}–${Math.min(
          total,
          from + perPage,
        )} of ${total}</span><div class="row"><button data-a="pg" data-i="${
          id
        }/${state.p - 1}" aria-label="Previous page"${
          state.p < 2 ? " disabled" : ""
        }>${ic("chevron-left")}</button>${pageNumbers()
          .map((number) =>
            number === "…"
              ? "<span>…</span>"
              : `<button data-a="pg" data-i="${id}/${number}"${
                  number === state.p ? ' aria-current="page"' : ""
                }>${number}</button>`,
          )
          .join("")}<button data-a="pg" data-i="${id}/${
          state.p + 1
        }" aria-label="Next page"${
          state.p >= pages ? " disabled" : ""
        }>${ic("chevron-right")}</button></div></div>`
      : total
        ? `<div class="pg"><span>${total} row${total > 1 ? "s" : ""}</span></div>`
        : "";

  const emptyHint = options.filtered
    ? "Try clearing the search or filters."
    : "";

  return `<div class="tw"><div class="sc"><table><thead><tr>${columns
    .map(header)
    .join("")}${
    options.act ? '<th class="x"></th>' : ""
  }</tr></thead><tbody>${
    body ||
    `<tr><td colspan="${columnCount}" style="padding:0"><div class="empty">${ic(
      options.icon || "inbox",
    )}<b>${options.empty || "Nothing here yet."}</b><span>${emptyHint}</span></div></td></tr>`
  }</tbody></table></div>${pager}</div>`;
}

export function exportTableCsv(id) {
  const table = tables[id];
  if (!table || !table.rows.length) {
    toast("Nothing to export.", "bad");
    return;
  }

  download(
    `sengonis-${table.name}-${today()}.csv`,
    toCSV(
      table.cols.map((column) => column.l),
      table.rows.map((row) =>
        table.cols.map((column) =>
          (column.v || ((value) => value[column.k]))(row),
        ),
      ),
    ),
    "text/csv",
  );
  toast(`Exported ${table.rows.length} rows`);
}
