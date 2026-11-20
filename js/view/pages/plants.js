/* Plants list. */

import { STATUSES } from "../../config.js";
import { esc, formatAge, formatDate, monthsOld } from "../../core/utils.js";
import { ic } from "../../core/icons.js";
import { state } from "../../model/store.js";
import { ui } from "../../model/ui.js";
import { plants } from "../../model/plants.js";
import { btn, exportButton, pageHead, pill, searchField, selectBox } from "../components.js";
import { dataTable } from "../table.js";

const matchesQuery = (plant) =>
  !ui.query ||
  [plant.id, plant.tgl, plant.st, "block " + plant.blok]
    .join(" ")
    .toLowerCase()
    .includes(ui.query.toLowerCase());

export function plantsPage() {
  const rows = state.tan.filter(
    (plant) =>
      (ui.plantBlock === "all" || plant.blok == ui.plantBlock) &&
      (ui.plantStatus === "all" || plant.st === ui.plantStatus) &&
      matchesQuery(plant),
  );

  const columns = [
    { k: "id", l: "ID", v: (plant) => plant.id, h: (plant) => `<b>#${plant.id}</b>` },
    { k: "tgl", l: "Planted", h: (plant) => formatDate(plant.tgl) },
    {
      k: "age",
      l: "Age",
      v: (plant) => monthsOld(plant.tgl),
      h: (plant) => formatAge(monthsOld(plant.tgl)),
    },
    { k: "tinggi", l: "Height (m)", v: (plant) => +plant.tinggi, r: 1 },
    { k: "dia", l: "Diameter (cm)", v: (plant) => +plant.dia, r: 1 },
    { k: "blok", l: "Block", v: (plant) => plant.blok, h: (plant) => "Block " + plant.blok },
    { k: "st", l: "Growth status", h: (plant) => pill(plant.st) },
  ];

  const living = state.tan.filter((plant) => plant.st !== "Dead").length;
  const addButton = `<button class="btn" data-a="pa">${ic("plus")}Add plant</button>`;

  return (
    pageHead(
      "sprout",
      "Plants",
      `${living} living of ${state.tan.length} recorded trees.`,
      addButton,
    ) +
    `<div class="tools"><div class="row">${searchField(
      ui.query,
      "Search plants",
    )}${selectBox(ui.plantBlock, "FB", [
      ["all", "All blocks"],
      ...plants.blocks().map((block) => [block, "Block " + block]),
    ])}${selectBox(ui.plantStatus, "PS", [
      ["all", "All statuses"],
      ...STATUSES,
    ])}</div><div class="row">${exportButton("plants")}</div></div>` +
    dataTable("plants", columns, rows, {
      name: "plants",
      icon: "sprout",
      empty: "No plants match.",
      filtered:
        !!ui.query || ui.plantBlock !== "all" || ui.plantStatus !== "all",
      act: (plant) =>
        `${plant.lng != null ? btn("loc", plant.id, "Locate", "ghost") : ""}${btn(
          "pe",
          plant.id,
          "Edit",
          "ghost",
        )}${btn("pd", plant.id, "Delete", "ghost")}`,
    })
  );
}
