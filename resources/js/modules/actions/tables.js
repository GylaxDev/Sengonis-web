/* Sorting, pagination and CSV export for data tables. */

import { ui } from "../ui.js";
import { tableState, exportTableCsv } from "../../views/table.js";
import { render } from "../router.js";

export const tableActions = {
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
};
