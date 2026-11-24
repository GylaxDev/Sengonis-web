/* Command palette markup. */

import { esc } from "../core/utils.js";
import { ic } from "../core/icons.js";

export function paletteShell() {
  return `<div class="mb top"><div class="pal" role="dialog" aria-modal="true" aria-label="Search"><div class="pin">${ic(
    "search",
  )}<input id="pq" placeholder="Search plants, transactions, pages or actions" autocomplete="off" aria-label="Search"><kbd>Esc</kbd></div><div class="pl" id="pl"></div><div class="pf"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span></div></div></div>`;
}

export function paletteList(items, activeIndex) {
  return items
    .map(
      (item, index) =>
        `<button class="pi${
          index === activeIndex ? " on" : ""
        }" data-a="palgo" data-i="${index}"><span class="dot">${ic(
          item.i,
        )}</span><span class="t"><b style="font-weight:500">${esc(
          item.t,
        )}</b><small>${esc(item.s)}</small></span>${
          index === activeIndex ? "<em>Enter</em>" : ""
        }</button>`,
    )
    .join("");
}

export function paletteEmpty() {
  return `<div class="empty">${ic(
    "search-x",
  )}<b>No results</b><span>Try a plant number, an amount or a page name.</span></div>`;
}
