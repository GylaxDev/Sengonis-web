/* Random Forest regression: bagged trees, random feature subsets, MSE splits.
   The model is small on purpose: it runs in the browser on demo data. */

import { config } from "../config.js";
import { seededRandom } from "../core/utils.js";
import { state } from "./store.js";

function grow(features, targets, indexes, depth, random) {
  const mean =
    indexes.reduce((sum, index) => sum + targets[index], 0) / indexes.length;
  if (depth === 0 || indexes.length < 4) return { value: mean };

  let best = null;
  const sumSquares = (subset) => {
    const average =
      subset.reduce((sum, index) => sum + targets[index], 0) / subset.length;
    return subset.reduce(
      (sum, index) => sum + (targets[index] - average) ** 2,
      0,
    );
  };

  const featureOrder = [0, 1, 2, 3].sort(() => random() - 0.5).slice(0, 2);
  for (const feature of featureOrder) {
    const values = [...new Set(indexes.map((index) => features[index][feature]))]
      .sort((a, b) => a - b);
    for (let k = 1; k < values.length; k++) {
      const threshold = (values[k - 1] + values[k]) / 2;
      const left = indexes.filter(
        (index) => features[index][feature] <= threshold,
      );
      const right = indexes.filter(
        (index) => features[index][feature] > threshold,
      );
      if (left.length < 2 || right.length < 2) continue;
      const cost = sumSquares(left) + sumSquares(right);
      if (!best || cost < best.cost) {
        best = { cost, feature, threshold, left, right };
      }
    }
  }

  if (!best) return { value: mean };
  return {
    feature: best.feature,
    threshold: best.threshold,
    left: grow(features, targets, best.left, depth - 1, random),
    right: grow(features, targets, best.right, depth - 1, random),
  };
}

const walk = (node, features) =>
  node.value !== undefined
    ? node.value
    : walk(
        features[node.feature] <= node.threshold ? node.left : node.right,
        features,
      );

/* Monthly series built from validated transactions and every mortality
   report (including drafts), matching the original dashboard behaviour. */
export function monthly() {
  const months = {};
  const add = (month, key, value) => {
    (months[month] ??= { m: month, deaths: 0, exp: 0, inc: 0 })[key] += value;
  };

  state.fin
    .filter((row) => row.status === "Validated")
    .forEach((row) =>
      add(row.tgl.slice(0, 7), row.jenis === "Sale" ? "inc" : "exp", row.nominal),
    );
  state.dead.forEach((report) =>
    add(report.tgl.slice(0, 7), "deaths", report.jumlah),
  );

  return Object.values(months).sort((a, b) => (a.m < b.m ? -1 : 1));
}

/* Loss = cash shortfall + cost per dead tree (Settings → Plantation). */
export function loss(month) {
  return (
    Math.max(0, month.exp - month.inc) + month.deaths * config.loss
  );
}

export function predict() {
  const months = monthly();
  if (months.length < 7) return null;

  const features = (month, index) => [
    month.deaths,
    month.exp / 1e6,
    month.inc / 1e6,
    months[index - 1] ? months[index - 1].deaths : 0,
  ];

  const X = months.slice(0, -1).map(features);
  const y = months.slice(1).map(loss);
  const random = seededRandom(7);
  let total = 0;

  for (let t = 0; t < 30; t++) {
    const indexes = Array.from({ length: X.length }, () =>
      Math.floor(random() * X.length),
    );
    total += walk(
      grow(X, y, indexes, 3, random),
      features(months[months.length - 1], months.length - 1),
    );
  }

  return total / 30;
}
