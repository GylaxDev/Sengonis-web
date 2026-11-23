/* MapLibre controller. The map element is created once and moved between
   page renders so panning and tilting survive UI updates. */

import { MAP_STYLE_URL } from "../core/config.js";
import { $, esc, today } from "../core/utils.js";
import { state } from "../model/store.js";
import { ui } from "../model/ui.js";
import { plants } from "../model/plants.js";
import {
  areaHa,
  bbox,
  blockAtPoint,
  blockByNumber,
  blocksGeoJSON,
  initGeo,
  moveAll,
  nextBlockNumber,
  plantsGeoJSON,
  reseatBlock,
} from "../model/geo.js";
import { plantFields } from "../view/fields.js";
import { blocksPanel, mapCanvasMarkup } from "../view/map.js";
import { rememberAction } from "./action-context.js";
import { confirmAction, done, openForm } from "./overlays.js";
import { navigate } from "./router.js";

const maplibre = window.maplibregl;

let map = null;
let wrapper = null;
let ready = false;
let markers = [];
let popup = null;
let mode = null;
let drawingBlock = null;
let draft = [];
let pendingLocate = null;
let queued = [];
let noteTimer = 0;

export const getMap = () => map;
export const isMapReady = () => ready;
export const selectedBlock = () => ui.mapBlock;

export function whenReady(callback) {
  if (ready) callback();
  else queued.push(callback);
}

export function mountMap() {
  const slot = $("#mapslot");
  if (!slot) return;

  if (!maplibre) {
    slot.innerHTML =
      '<p class="mut">The map library could not be loaded. Check your internet connection and reload the page.</p>';
    return;
  }

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "mw";
    wrapper.innerHTML = mapCanvasMarkup();
    slot.appendChild(wrapper);
    initMap();
  } else {
    slot.appendChild(wrapper);
    map.resize();
    paintMapData();
  }

  bindPlaceSearch();

  if (pendingLocate) {
    const id = pendingLocate;
    pendingLocate = null;
    whenReady(() => flyToPlant(id));
  }
}

function initMap() {
  map = new maplibre.Map({
    container: "map",
    style: MAP_STYLE_URL,
    center: state.geo.c,
    zoom: 17,
    pitch: 60,
    bearing: -20,
    maxPitch: 80,
    attributionControl: { compact: true },
  });

  map.addControl(
    new maplibre.NavigationControl({ visualizePitch: true }),
    "top-right",
  );
  map.addControl(new maplibre.ScaleControl({ unit: "metric" }), "bottom-left");

  map.on("load", () => {
    addMapLayers();
    ready = true;
    const loading = wrapper.querySelector(".mld");
    if (loading) loading.remove();
    paintMapData();
    homeView(false);
    queued.splice(0).forEach((callback) => callback());
  });

  map.on("error", () => {
    if (ready) return;
    const loading = wrapper.querySelector(".mld");
    if (loading) {
      loading.textContent =
        "The map could not be loaded. Check your internet connection.";
    }
  });

  map.on("click", mapClick);
  map.on("mouseenter", "dots", () => {
    if (!mode) map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "dots", () => {
    map.getCanvas().style.cursor = mode ? "crosshair" : "";
  });
}

function addMapLayers() {
  const symbolLayer = map.getStyle().layers.find((layer) => layer.type === "symbol");
  const beforeId = symbolLayer && symbolLayer.id;

  map.addSource("terrain", {
    type: "raster-dem",
    tiles: [
      "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
    ],
    encoding: "terrarium",
    tileSize: 256,
    maxzoom: 15,
    attribution: "Terrain: Mapzen on AWS",
  });

  ["blocks", "plants", "trees", "draft"].forEach((id) =>
    map.addSource(id, { type: "geojson", data: blocksGeoJSON(null) }),
  );

  map.addLayer(
    {
      id: "blocks-fill",
      type: "fill",
      source: "blocks",
      paint: {
        "fill-color": "#3f8f45",
        "fill-opacity": ["case", ["==", ["get", "sel"], 1], 0.38, 0.2],
      },
    },
    beforeId,
  );

  map.addLayer(
    {
      id: "blocks-line",
      type: "line",
      source: "blocks",
      paint: {
        "line-color": "#1f5a28",
        "line-width": ["case", ["==", ["get", "sel"], 1], 4, 2.5],
      },
    },
    beforeId,
  );

  map.addLayer({
    id: "trees",
    type: "fill-extrusion",
    source: "trees",
    paint: {
      "fill-extrusion-color": ["get", "c"],
      "fill-extrusion-height": ["get", "h"],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.95,
    },
  });

  map.addLayer({
    id: "dots",
    type: "circle",
    source: "plants",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 15, 2, 18, 4, 20, 7],
      "circle-color": [
        "match",
        ["get", "st"],
        "Seedling",
        "#9ed36a",
        "Growing",
        "#4c9a3a",
        "Mature",
        "#1f6b2a",
        "#8d8d8d",
      ],
      "circle-stroke-color": "#fff",
      "circle-stroke-width": 1,
    },
  });

  map.addLayer({
    id: "draft-line",
    type: "line",
    source: "draft",
    filter: ["==", ["geometry-type"], "LineString"],
    paint: {
      "line-color": "#e3a21a",
      "line-width": 3,
      "line-dasharray": [2, 1],
    },
  });

  map.addLayer({
    id: "draft-pts",
    type: "circle",
    source: "draft",
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": 5,
      "circle-color": "#e3a21a",
      "circle-stroke-color": "#fff",
      "circle-stroke-width": 2,
    },
  });

  map.setTerrain({ source: "terrain", exaggeration: 1.3 });
}

function paintMapData() {
  if (!ready) return;

  if (popup) {
    popup.remove();
    popup = null;
  }

  const [points, trees] = plantsGeoJSON();
  map.getSource("blocks").setData(blocksGeoJSON(ui.mapBlock));
  map.getSource("plants").setData(points);
  map.getSource("trees").setData(trees);

  markers.forEach((marker) => marker.remove());
  markers = state.geo.b.map((block) => {
    const element = document.createElement("div");
    element.className = "bl";
    const alive = state.tan.filter(
      (plant) => plant.blok == block.n && plant.st !== "Dead",
    ).length;
    element.innerHTML = `<b>Block ${block.n}</b><small>${alive} trees, ${areaHa(
      block.ring,
    ).toFixed(2)} ha</small>`;
    return new maplibre.Marker({ element })
      .setLngLat(center(block.ring))
      .addTo(map);
  });

  paintBlocks();
}

function center(ring) {
  const box = bbox(ring);
  return [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
}

export function paintBlocks() {
  const element = $("#bkl");
  if (element) element.innerHTML = blocksPanel(ui.mapBlock);
}

export function homeView(animate) {
  const points = state.geo.b.flatMap((block) => block.ring);
  if (!points.length) {
    map.jumpTo({ center: state.geo.c, zoom: 17 });
    return;
  }

  const box = bbox(points);
  map.fitBounds(
    [
      [box[0], box[1]],
      [box[2], box[3]],
    ],
    {
      padding: 70,
      pitch: 60,
      bearing: -20,
      maxZoom: 19,
      duration: animate ? 1200 : 0,
    },
  );
}

export function setMode(nextMode, block) {
  mode = nextMode;
  drawingBlock = block;
  draft = [];
  drawDraft();
  banner();
  map.getCanvas().style.cursor = mode ? "crosshair" : "";
  if (mode === "draw") map.doubleClickZoom.disable();
  else map.doubleClickZoom.enable();
}

function banner() {
  const element = wrapper.querySelector(".mbn");
  if (!mode) {
    element.hidden = true;
    return;
  }

  const text = {
    plant: "Click inside a block to plant a tree.",
    move: "Click where the middle of the plantation should be.",
    draw: `Block ${
      drawingBlock === "new" ? nextBlockNumber() : drawingBlock
    }: click each corner of the boundary (${draft.length} placed).`,
  }[mode];

  element.innerHTML = `<span>${text}</span>${
    mode === "draw"
      ? `<button class="btn sm" data-a="mu">Undo</button><button class="btn sm" data-a="mf">Finish</button>`
      : ""
  }<button class="btn sm" data-a="mc">${
    mode === "plant" ? "Done" : "Cancel"
  }</button>`;
  element.hidden = false;
}

function note(message) {
  const element = wrapper.querySelector(".mbn");
  element.innerHTML = `<span>${esc(message)}</span>`;
  element.hidden = false;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(banner, 2600);
}

function drawDraft() {
  const source = map && map.getSource("draft");
  if (!source) return;

  const features = draft.map((point) =>
    feature({}, { type: "Point", coordinates: point }),
  );
  if (draft.length > 1) {
    features.push(
      feature(
        {},
        {
          type: "LineString",
          coordinates:
            draft.length > 2 ? [...draft, draft[0]] : draft,
        },
      ),
    );
  }
  source.setData(collection(features));
}

function feature(properties, geometry) {
  return { type: "Feature", properties, geometry };
}

function collection(features) {
  return { type: "FeatureCollection", features };
}

function finishDraw() {
  if (draft.length < 3) {
    note("Add at least 3 corners first.");
    return;
  }

  const ring = draft.slice();
  const isNew = drawingBlock === "new";
  const number = isNew ? nextBlockNumber() : drawingBlock;
  rememberAction(isNew ? "bka" : "bke", number);

  if (isNew) state.geo.b.push({ n: number, ring });
  else blockByNumber(number).ring = ring;

  reseatBlock(number);
  initGeo();
  setMode(null);
  done();
}

function movePlantation(point) {
  moveAll(point);
  setTimeout(() => {
    if (map) homeView(true);
  }, 80);
}

export function mapClick(event) {
  const point = [event.lngLat.lng, event.lngLat.lat];

  if (mode === "draw") {
    draft.push(point);
    drawDraft();
    return banner();
  }

  if (mode === "plant") {
    const block = blockAtPoint(point);
    if (!block) {
      return note("That spot is outside every block. Click inside a block.");
    }

    rememberAction("mp");
    return openForm(
      "Plant a tree in Block " + block.n,
      plantFields.filter((field) => field.k !== "blok"),
      { tgl: today(), tinggi: 0, dia: 0, st: "Seedling" },
      (data) => {
        plants.addAt(data, block.n, point[0], point[1]);
        done();
      },
    );
  }

  if (mode === "move") {
    rememberAction("mv");
    setMode(null);
    return confirmAction(
      "Move the whole plantation (all blocks and trees) so its middle is here?",
      () => movePlantation(point),
    );
  }

  const plantFeature = map.queryRenderedFeatures(event.point, {
    layers: ["dots", "trees"],
  })[0];
  if (plantFeature) return showPlantPopup(plantFeature.properties.id);

  const blockFeature = map.queryRenderedFeatures(event.point, {
    layers: ["blocks-fill"],
  })[0];
  if (blockFeature) selectBlock(blockFeature.properties.n);
}

function showPlantPopup(id) {
  const plant = plants.byId(id);
  if (!plant || plant.lng == null) return;

  if (popup) popup.remove();
  popup = new maplibre.Popup({ maxWidth: "260px", offset: 8 })
    .setLngLat([plant.lng, plant.lat])
    .setHTML(
      `<b>Plant ${plant.id}</b>, Block ${plant.blok}<br>Planted ${esc(
        plant.tgl,
      )}<br>Height ${esc(plant.tinggi)} m, diameter ${esc(
        plant.dia,
      )} cm<br>Status: ${esc(
        plant.st,
      )}<div style="margin-top:8px"><button class="btn sm" data-a="pe" data-i="${
        plant.id
      }">Edit</button></div>`,
    )
    .addTo(map);
}

export function selectBlock(number) {
  ui.mapBlock = ui.mapBlock == number ? null : +number;
  map.getSource("blocks").setData(blocksGeoJSON(ui.mapBlock));
  paintBlocks();

  const block = blockByNumber(ui.mapBlock);
  if (!block) return;

  const box = bbox(block.ring);
  map.fitBounds(
    [
      [box[0], box[1]],
      [box[2], box[3]],
    ],
    {
      padding: 80,
      maxZoom: 19.5,
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      duration: 900,
    },
  );
}

function deleteBlock(number) {
  state.geo.b = state.geo.b.filter((block) => block.n != number);
  state.tan
    .filter((plant) => plant.blok == number)
    .forEach((plant) => {
      delete plant.lng;
      delete plant.lat;
    });
  if (ui.mapBlock == number) ui.mapBlock = null;
}

function toggle3D() {
  const on = map.getPitch() < 10;
  map.easeTo({ pitch: on ? 60 : 0, duration: 700 });
  wrapper
    .querySelector('[data-a="m3"]')
    .setAttribute("aria-pressed", on);
}

function toggleTerrain() {
  const button = wrapper.querySelector('[data-a="mter"]');
  const on = button.getAttribute("aria-pressed") !== "true";
  map.setTerrain(on ? { source: "terrain", exaggeration: 1.3 } : null);
  button.setAttribute("aria-pressed", on);
}

function locateOnMap(id) {
  pendingLocate = +id;
  navigate("map");
}

function flyToPlant(id) {
  const plant = plants.byId(id);
  if (!plant || plant.lng == null) return;

  map.flyTo({
    center: [plant.lng, plant.lat],
    zoom: 19.5,
    pitch: 65,
    duration: 1400,
  });
  setTimeout(() => showPlantPopup(id), 1500);
}

function bindPlaceSearch() {
  const form = $("#gs");
  if (!form) return;

  form.onsubmit = async (event) => {
    event.preventDefault();
    const query = String(new FormData(form).get("q")).trim();
    if (!query) return;

    try {
      const response = await fetch(
        "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" +
          encodeURIComponent(query),
      );
      const results = await response.json();
      if (!results[0]) throw new Error("Not found");
      map.flyTo({
        center: [+results[0].lon, +results[0].lat],
        zoom: 16.5,
        pitch: 60,
        duration: 1500,
      });
    } catch (error) {
      note("Could not find that place.");
    }
  };
}

export function cancelMode() {
  if (mode && wrapper) setMode(null);
}

export const mapActions = {
  mp: () => setMode("plant"),
  bka: () => setMode("draw", "new"),
  bke: (number) => setMode("draw", +number),
  mv: () => setMode("move"),
  mu: () => {
    draft.pop();
    drawDraft();
    banner();
  },
  mf: finishDraw,
  mc: () => setMode(null),
  m3: toggle3D,
  mter: toggleTerrain,
  mhm: () => homeView(true),
  loc: locateOnMap,
  bks: selectBlock,
  bkd: (number) =>
    confirmAction(
      `Delete block ${number}? Its trees stay in the records but lose their map position.`,
      () => deleteBlock(number),
    ),
};
