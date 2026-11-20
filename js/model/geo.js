/* Geometry and map data: blocks, plant positions and GeoJSON builders.
   MapLibre itself lives in the map controller; this module is data only. */

import { DEFAULT_CENTER, MAP_COLORS } from "../config.js";
import { state } from "./store.js";

const METRES_PER_LNG = (lat) => 111320 * Math.cos((lat * Math.PI) / 180);
const METRES_PER_LAT = 110574;

const offset = (center, dx, dy) => [
  center[0] + dx / METRES_PER_LNG(center[1]),
  center[1] + dy / METRES_PER_LAT,
];

const rectangle = (center, x0, y0, x1, y1) => [
  offset(center, x0, y1),
  offset(center, x1, y1),
  offset(center, x1, y0),
  offset(center, x0, y0),
];

function defaultGrid(center) {
  const width = 90;
  const height = 70;
  const gap = 8;
  const blocks = [];
  for (let index = 0; index < 4; index++) {
    const x0 = index % 2 ? gap / 2 : -gap / 2 - width;
    const y0 = index >> 1 ? -gap / 2 - height : gap / 2;
    blocks.push({
      n: index + 1,
      ring: rectangle(center, x0, y0, x0 + width, y0 + height),
    });
  }
  return blocks;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] <
        ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function bbox(ring) {
  return ring.reduce(
    (box, point) => [
      Math.min(box[0], point[0]),
      Math.min(box[1], point[1]),
      Math.max(box[2], point[0]),
      Math.max(box[3], point[1]),
    ],
    [1e9, 1e9, -1e9, -1e9],
  );
}

export function centerOf(ring) {
  const box = bbox(ring);
  return [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
}

/* Area in hectares. */
export function areaHa(ring) {
  const origin = ring[0];
  const lngScale = METRES_PER_LNG(origin[1]);
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const point = ring[i];
    const next = ring[(i + 1) % ring.length];
    area +=
      (point[0] - origin[0]) * lngScale * (next[1] - origin[1]) * METRES_PER_LAT -
      (next[0] - origin[0]) * lngScale * (point[1] - origin[1]) * METRES_PER_LAT;
  }
  return Math.abs(area) / 2 / 1e4;
}

function randomPointIn(ring) {
  const box = bbox(ring);
  for (let i = 0; i < 60; i++) {
    const point = [
      box[0] + Math.random() * (box[2] - box[0]),
      box[1] + Math.random() * (box[3] - box[1]),
    ];
    if (pointInRing(point, ring)) return point;
  }
  return centerOf(ring);
}

function slotPoint(ring, index, count) {
  const box = bbox(ring);
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const point = [
    box[0] +
      (box[2] - box[0]) * (0.12 + (0.76 * ((index % columns) + 0.5)) / columns),
    box[1] +
      (box[3] - box[1]) *
        (0.12 + (0.76 * (Math.floor(index / columns) + 0.5)) / rows),
  ];
  return pointInRing(point, ring) ? point : randomPointIn(ring);
}

export function blockByNumber(number) {
  return state.geo.b.find((block) => block.n == number);
}

export function blockAtPoint(point) {
  return state.geo.b.find((block) => pointInRing(point, block.ring));
}

export function nextBlockNumber() {
  return Math.max(0, ...state.geo.b.map((block) => block.n)) + 1;
}

export function autoSpot(blockNumber) {
  const block = blockByNumber(blockNumber);
  if (!block) return {};

  const existing = state.tan.filter(
    (plant) => plant.blok == blockNumber && plant.lng != null,
  );
  let point;
  for (let i = 0; i < 40; i++) {
    point = randomPointIn(block.ring);
    const farEnough = existing.every(
      (plant) =>
        Math.hypot(
          (plant.lng - point[0]) * METRES_PER_LNG(point[1]),
          (plant.lat - point[1]) * METRES_PER_LAT,
        ) > 4,
    );
    if (farEnough) break;
  }
  return { lng: point[0], lat: point[1] };
}

/* Creates the default four blocks and gives every plant a map position.
   Called after the store is loaded or replaced. */
export function initGeo() {
  if (!state.geo || !state.geo.b) {
    state.geo = {
      c: (state.geo && state.geo.c) || DEFAULT_CENTER.slice(),
      b: null,
    };
  }

  const geo = state.geo;
  if (!geo.b) geo.b = defaultGrid(geo.c);

  [...new Set(state.tan.map((plant) => plant.blok))].forEach((blockNumber) => {
    const block = blockByNumber(blockNumber);
    if (!block) return;

    const all = state.tan.filter((plant) => plant.blok == blockNumber);
    const missing = all.filter((plant) => plant.lng == null);
    if (!missing.length) return;

    if (missing.length === all.length) {
      missing.forEach((plant, index) => {
        const point = slotPoint(block.ring, index, all.length);
        plant.lng = point[0];
        plant.lat = point[1];
      });
    } else {
      missing.forEach((plant) => Object.assign(plant, autoSpot(blockNumber)));
    }
  });
}

export function reseatBlock(blockNumber) {
  const block = blockByNumber(blockNumber);
  state.tan
    .filter(
      (plant) =>
        plant.blok == blockNumber &&
        plant.lng != null &&
        !pointInRing([plant.lng, plant.lat], block.ring),
    )
    .forEach((plant) => Object.assign(plant, autoSpot(blockNumber)));
}

const collection = (features) => ({ type: "FeatureCollection", features });

const feature = (properties, geometry) => ({
  type: "Feature",
  properties,
  geometry,
});

function disk(center, radius, points = 10) {
  const ring = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    ring.push(
      offset(center, Math.cos(angle) * radius, Math.sin(angle) * radius),
    );
  }
  ring.push(ring[0]);
  return ring;
}

export function blocksGeoJSON(selectedBlock) {
  return collection(
    state.geo.b.map((block) =>
      feature(
        { n: block.n, sel: selectedBlock == block.n ? 1 : 0 },
        { type: "Polygon", coordinates: [[...block.ring, block.ring[0]]] },
      ),
    ),
  );
}

export function plantsGeoJSON() {
  const located = state.tan.filter((plant) => plant.lng != null);

  const points = collection(
    located.map((plant) =>
      feature(
        { id: plant.id, st: plant.st },
        { type: "Point", coordinates: [plant.lng, plant.lat] },
      ),
    ),
  );

  const trees = collection(
    located.map((plant) =>
      feature(
        {
          id: plant.id,
          st: plant.st,
          h: Math.max(0.3, +plant.tinggi || 0),
          c: MAP_COLORS[plant.st] || MAP_COLORS.Growing,
        },
        {
          type: "Polygon",
          coordinates: [
            disk(
              [plant.lng, plant.lat],
              Math.min(2.2, 0.5 + (+plant.tinggi || 0) * 0.15),
            ),
          ],
        },
      ),
    ),
  );

  return [points, trees];
}

/* Moves every block and located plant so the plantation centre is `point`. */
export function moveAll(point) {
  const previous = state.geo.c;
  const move = (coordinate) =>
    offset(
      point,
      (coordinate[0] - previous[0]) * METRES_PER_LNG(previous[1]),
      (coordinate[1] - previous[1]) * METRES_PER_LAT,
    );

  state.geo.b.forEach((block) => {
    block.ring = block.ring.map(move);
  });

  state.tan.forEach((plant) => {
    if (plant.lng == null) return;
    const moved = move([plant.lng, plant.lat]);
    plant.lng = moved[0];
    plant.lat = moved[1];
  });

  state.geo.c = point;
}
