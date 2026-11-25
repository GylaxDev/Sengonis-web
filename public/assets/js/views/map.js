/* Map page markup and the blocks side panel. */

import { MAP_COLORS } from "../core/config.js";
import { ic } from "../core/icons.js";
import { auth } from "../modules/auth.js";
import { state } from "../modules/store.js";
import { ui } from "../modules/ui.js";
import { areaHa } from "../modules/geo.js";
import { btn, pageHead } from "./components.js";
import { weatherCard } from "./weather.js";

export function blocksPanel(selectedBlock) {
  const unlocated = state.tan.filter(
    (plant) => plant.st !== "Dead" && plant.lng == null,
  ).length;

  const blocks = state.geo.b
    .slice()
    .sort((a, b) => a.n - b.n)
    .map((block) => {
      const plants = state.tan.filter((plant) => plant.blok == block.n);
      const alive = plants.filter((plant) => plant.st !== "Dead");
      return `<div class="bk${selectedBlock == block.n ? " on" : ""}" data-a="bks" data-i="${
        block.n
      }"><div><b>Block ${block.n}</b><small>${alive.length}/${
        plants.length
      } trees, ${areaHa(block.ring).toFixed(2)} ha</small></div>${
        auth.isOwner()
          ? `<span class="row">${btn(
              "bke",
              block.n,
              "Redraw",
              "ghost",
            )}${btn("bkd", block.n, "Delete", "ghost")}</span>`
          : ""
      }</div>`;
    })
    .join("");

  return (
    `<div class="ch-h"><h2>Blocks<small>Click a block to zoom to it</small></h2></div>` +
    (blocks ||
      `<p class="mut">No blocks yet.${
        auth.isOwner() ? " Use “Add block” to draw one." : ""
      }</p>`) +
    (unlocated
      ? `<small class="mut" style="display:block;margin-top:12px">${unlocated} living tree${
          unlocated > 1 ? "s have" : " has"
        } no map position because ${
          unlocated > 1 ? "their blocks are" : "its block is"
        } not drawn.</small>`
      : "") +
    `<div class="lgd">${["Seedling", "Growing", "Mature", "Dead"]
      .map(
        (status) =>
          `<span><i style="background:${MAP_COLORS[status]}"></i>${status}</span>`,
      )
      .join("")}</div>`
  );
}

export function mapPage() {
  const actions = `<form class="search" id="gs">${ic(
    "search",
  )}<input name="q" placeholder="Find a place" aria-label="Find a place"></form><button class="btn" data-a="mp">${ic(
    "sprout",
  )}Plant tree</button>${
    auth.isOwner()
      ? `<button class="btn ghost" data-a="bka">${ic(
          "plus",
        )}Add block</button><button class="btn ghost" data-a="mv">${ic(
          "map-pin",
        )}Move plantation</button>`
      : ""
  }`;

  return (
    pageHead(
      "map",
      "Plantation map",
      "Drag to pan. Right-drag (or Ctrl-drag) to rotate and tilt. Trees are drawn at their recorded height.",
      actions,
    ) +
    `<div class="mapgrid"><section class="card mapcard" style="padding:10px"><div id="mapslot"></div></section><div class="col"><section class="card wx" data-wx>${weatherCard()}</section><section class="card" id="bkl">${blocksPanel(
      ui.mapBlock,
    )}</section></div></div>`
  );
}

/* The persistent map element, created once and moved between renders. */
export function mapCanvasMarkup() {
  return `<div id="map"></div><div class="mtl"><button class="btn sm" data-a="m3" aria-pressed="true">3D</button><button class="btn sm" data-a="mter" aria-pressed="true">${ic(
    "mountain",
  )}Terrain</button><button class="btn sm" data-a="mhm">${ic(
    "locate-fixed",
  )}Reset view</button></div><div class="mbn" hidden></div><div class="mld">Loading map…</div>`;
}
