/* Plant records and the block list derived from them. */

import { state } from "./store.js";
import { nextId } from "../core/utils.js";
import { autoSpot } from "./geo.js";

export const plants = {
  all() {
    return state.tan;
  },

  byId(id) {
    return state.tan.find((plant) => plant.id == id);
  },

  living() {
    return state.tan.filter((plant) => plant.st !== "Dead");
  },

  /* Blocks that exist on the map or are referenced by a plant. */
  blocks() {
    return [
      ...new Set([
        ...state.geo.b.map((block) => block.n),
        ...state.tan.map((plant) => plant.blok),
      ]),
    ].sort((a, b) => a - b);
  },

  add(data) {
    const plant = { id: nextId(state.tan), ...data, ...autoSpot(data.blok) };
    state.tan.push(plant);
    return plant;
  },

  update(id, data) {
    const plant = this.byId(id);
    if (!plant) return null;
    const previousBlock = plant.blok;
    Object.assign(plant, data);
    if (plant.blok != previousBlock) {
      delete plant.lng;
      delete plant.lat;
      Object.assign(plant, autoSpot(plant.blok));
    }
    return plant;
  },

  remove(id) {
    state.tan = state.tan.filter((plant) => plant.id != id);
  },

  addAt(data, blockNumber, lng, lat) {
    const plant = {
      id: nextId(state.tan),
      ...data,
      blok: blockNumber,
      lng,
      lat,
    };
    state.tan.push(plant);
    return plant;
  },
};
