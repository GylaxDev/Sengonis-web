/* Command palette (Ctrl/Cmd+K or "/"): pages, records and common actions. */

import { $, $$, formatDate, formatMonth, money } from "../core/utils.js";
import { auth } from "../model/auth.js";
import { state } from "../model/store.js";
import { createActions, navigation } from "../view/layout.js";
import {
  paletteEmpty,
  paletteList,
  paletteShell,
} from "../view/palette.js";
import { rememberAction } from "./action-context.js";

let palette = null;
let execute = null;

export const isPaletteOpen = () => !!palette;

function items(query) {
  const search = query.toLowerCase().trim();
  const results = [];

  navigation().forEach((page) =>
    results.push({
      t: "Go to " + page[1],
      s: "Page",
      i: page[2],
      a: "go",
      d: page[0],
      k: page[1],
    }),
  );

  createActions().forEach((action) =>
    results.push({
      t: action[2],
      s: "Create",
      i: action[1],
      a: action[0],
      k: action[3],
    }),
  );

  results.push(
    { t: "Toggle dark mode", s: "Action", i: "moon", a: "theme2" },
    { t: "Download backup", s: "Action", i: "download", a: "bkp" },
    { t: "Sign out", s: "Action", i: "log-out", a: "out" },
  );

  if (search.length >= 1) {
    state.tan.forEach((plant) =>
      results.push({
        t: "Plant #" + plant.id,
        s: `Block ${plant.blok} · ${plant.st}`,
        i: "sprout",
        a: "loc",
        d: plant.id,
        k: "tree plant " + plant.id + " " + plant.st,
      }),
    );
    state.fin.forEach((row) =>
      results.push({
        t: `${row.jenis} · ${money(row.nominal)}`,
        s: `${formatDate(row.tgl)} · ${row.status}`,
        i: "receipt",
        a: "srch",
        d: "inventory|" + row.tgl,
        k: "transaction " + row.bayar,
      }),
    );
    state.lap.forEach((report) =>
      results.push({
        t: "Financial report " + formatMonth(report.periode),
        s: report.status,
        i: "file-text",
        a: "srch",
        d: "reports|",
        k: "report",
      }),
    );
  }

  const filtered = search
    ? results.filter((item) =>
        (item.t + " " + item.s + " " + (item.k || ""))
          .toLowerCase()
          .includes(search),
      )
    : results.slice(0, 9);

  return filtered.slice(0, 10);
}

function paint() {
  $("#pl").innerHTML = palette.items.length
    ? paletteList(palette.items, palette.i)
    : paletteEmpty();
  const active = $("#pl .on");
  if (active) active.scrollIntoView({ block: "nearest" });
}

export function openPalette(runAction) {
  if (!auth.current) return;

  execute = runAction;
  $("#m").innerHTML = "";
  $$(".pop").forEach((popover) => (popover.hidden = true));

  palette = { q: "", i: 0, items: items("") };
  $("#pal").innerHTML = paletteShell();
  paint();
  $("#pq").focus();

  $("#pq").oninput = (event) => {
    palette.q = event.target.value;
    palette.i = 0;
    palette.items = items(palette.q);
    paint();
  };

  $("#pq").onkeydown = (event) => {
    const count = palette.items.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      palette.i = (palette.i + 1) % Math.max(1, count);
      paint();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      palette.i = (palette.i - 1 + count) % Math.max(1, count);
      paint();
    } else if (event.key === "Enter") {
      event.preventDefault();
      paletteGo(palette.i);
    } else if (event.key === "Escape") {
      event.stopPropagation();
      closePalette();
    }
  };
}

export function closePalette() {
  $("#pal").innerHTML = "";
  palette = null;
}

export function paletteGo(index) {
  const item = palette && palette.items[index];
  if (!item) return;

  closePalette();
  rememberAction(item.a, item.d);
  if (execute) execute(item.a, item.d);
}
