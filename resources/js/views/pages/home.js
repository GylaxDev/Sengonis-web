/* Dashboard. */

import {
  STATUSES,
  STAGE_CHART_COLORS,
  config,
} from "../../core/config.js";
import {
  esc,
  formatMonth,
  money,
  moneyShort,
  timeAgo,
} from "../../core/utils.js";
import { ic } from "../../core/icons.js";
import { auth } from "../../modules/auth.js";
import { state } from "../../modules/store.js";
import { ui } from "../../modules/ui.js";
import { plants } from "../../modules/plants.js";
import { deathsByCause, pendingCounts } from "../../modules/reports.js";
import { loss, monthly, predict } from "../../modules/forecast.js";
import { art, shortName } from "../components.js";
import { barChart } from "../chart.js";
import { weatherCard } from "../weather.js";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 15) return "Good afternoon";
  if (hour < 19) return "Good evening";
  return "Good night";
}

export function homePage() {
  const allMonths = monthly();
  const months = allMonths.slice(-ui.period);
  const labels = months.map((month) => month.m);
  const living = state.tan.filter((plant) => plant.st !== "Dead");
  const population = living.length;
  const net = months.reduce((sum, month) => sum + month.inc - month.exp, 0);
  const deaths = months.reduce((sum, month) => sum + month.deaths, 0);
  const prediction = predict();
  const blockNumbers = plants.blocks();
  const causes = deathsByCause();
  const topCause = Object.entries(causes).sort((a, b) => b[1] - a[1])[0];
  const maxBlock = Math.max(
    1,
    ...blockNumbers.map(
      (block) => state.tan.filter((plant) => plant.blok == block).length,
    ),
  );
  const pending = pendingCounts();
  const waiting = pending.transactions + pending.financial + pending.mortality;
  const stages = STATUSES.map((status) => [
    status,
    state.tan.filter((plant) => plant.st === status).length,
  ]);
  const totalPlants = Math.max(1, state.tan.length);
  const activity = auth.isOwner()
    ? state.log
    : state.log.filter((entry) => entry.u === auth.current.nama);

  const hero = `<section class="hero"><div class="hc"><p class="eye">${esc(
    config.plantName,
  )} is for forest keepers</p><h1>${greeting()}, ${esc(
    shortName(auth.current),
  )}</h1><p class="sub">Every sengon tree, every rupiah and every risk, from seedling to harvest, in one place.</p><div class="row"><button class="btn" data-a="pa">${ic(
    "plus",
  )}Add plant</button><button class="btn ghost" data-a="go" data-i="map">${ic(
    "map",
  )}Open the map</button></div></div><div class="hart">${art()}</div></section>`;

  const stats = `<div class="gs"><div class="stat"><span class="l">Living trees</span><b>${population}</b><span class="s">${Math.round(
    (population / totalPlants) * 100,
  )}% of ${
    state.tan.length
  } planted survive</span><i class="tic">${ic(
    "sprout",
  )}</i></div>
  <div class="stat"><span class="l">Net cash flow · ${
    ui.period
  } mo</span><b class="${
    net < 0 ? "neg" : "pos"
  }" title="${money(net)}">${moneyShort(
    net,
  )}</b><span class="s">Validated transactions only</span><i class="tic">${ic(
    "trend",
  )}</i></div>
  <div class="stat"><span class="l">Trees lost · ${
    ui.period
  } mo</span><b>${deaths}</b><span class="s">${
    topCause
      ? "Most common cause: " + topCause[0]
      : "No losses recorded"
  }</span><i class="tic">${ic("alert")}</i></div>
  <div class="stat"><span class="l">Predicted loss · next mo</span><b title="${
    prediction == null ? "" : money(prediction)
  }">${
    prediction == null ? "Not enough data" : moneyShort(prediction)
  }</b><span class="s">${
    prediction == null
      ? "Needs 7+ months of validated data."
      : `Random Forest · last month ${moneyShort(
          loss(allMonths[allMonths.length - 1]),
        )}`
  }</span><i class="tic">${ic("spark")}</i></div></div>`;

  const trendCard = `<section class="card"><div class="ch-h"><h2>Data trends</h2><div class="seg" role="group" aria-label="Period">${[
    3, 6, 12,
  ]
    .map(
      (period) =>
        `<button data-a="per" data-i="${period}" aria-pressed="${
          period === ui.period
        }">${period} mo</button>`,
    )
    .join(
      "",
    )}</div></div><p class="sub-t">Net cash flow</p>${barChart(
    months.map((month) => month.inc - month.exp),
    labels,
    money,
  )}<p class="sub-t" style="margin-top:22px">Tree deaths</p>${barChart(
    months.map((month) => month.deaths),
    labels,
    (value) => value + " trees",
  )}</section>`;

  const blockCard = `<section class="card"><div class="ch-h"><h2>Plantation by block<small>Living trees out of total planted</small></h2></div><div class="stk" role="img" aria-label="Growth stage mix">${stages
    .map(([status, count]) =>
      count
        ? `<i style="flex:${count};background:${STAGE_CHART_COLORS[status]}" title="${status}: ${count}"></i>`
        : "",
    )
    .join(
      "",
    )}</div><div class="lgd" style="margin:10px 0 18px">${stages
    .map(
      ([status, count]) =>
        `<span><i style="background:${STAGE_CHART_COLORS[status]}"></i>${status} ${count}</span>`,
    )
    .join(
      "",
    )}</div>${blockNumbers
    .map((block) => {
      const blockPlants = state.tan.filter((plant) => plant.blok == block);
      const alive = blockPlants.filter((plant) => plant.st !== "Dead");
      const averageHeight = alive.length
        ? (alive.reduce((sum, plant) => sum + plant.tinggi, 0) / alive.length).toFixed(1)
        : "0";
      return `<div class="hz"><span>Block ${block} · ${averageHeight} m</span><div class="t"><i style="width:${
        (alive.length / maxBlock) * 100
      }%"></i></div><span>${alive.length}/${blockPlants.length}</span></div>`;
    })
    .join(
      "",
    )}<small class="mut">Average height shown is for living trees.</small></section>`;

  const reviewItems = [
    ["pinv", "receipt", pending.transactions, "transaction"],
    ["plap", "file-text", pending.financial, "financial report"],
    ["pmor", "triangle-alert", pending.mortality, "mortality report"],
  ].filter((item) => item[2]);

  const reviewCard = `<section class="card"><div class="ch-h"><h2>${
    auth.isOwner() ? "Needs your review" : "Waiting for the owner"
  }</h2></div>${
    waiting
      ? reviewItems
          .map(
            (item) =>
              `<button class="li" data-a="${item[0]}"><span class="dot">${ic(
                item[1],
              )}</span><div><b>${item[2]} ${item[3]}${
                item[2] > 1 ? "s" : ""
              }</b><small>${
                auth.isOwner() ? "Ready to validate" : "Pending approval"
              }</small></div><span class="go">${ic(
                "chevron-right",
              )}</span></button>`,
          )
          .join("")
      : `<div class="ok-note">${ic(
          "circle-check",
        )}All caught up. Nothing is waiting.</div>`
  }</section>`;

  const activityCard = `<section class="card"><div class="ch-h"><h2>Recent activity</h2></div>${
    activity
      .slice(0, 5)
      .map(
        (entry) =>
          `<div class="li"><span class="dot">${ic(
            "history",
          )}</span><div>${esc(entry.x)}<small>${
            auth.isOwner() ? esc(entry.u) + " · " : ""
          }${timeAgo(entry.t)}</small></div></div>`,
      )
      .join("") ||
    `<p class="mut" style="margin:0">Nothing yet. Changes you make will appear here.</p>`
  }</section>`;

  return (
    hero +
    stats +
    `<div class="g2"><div class="col">${trendCard}${blockCard}</div>` +
    `<div class="col"><section class="card wx" data-wx>${weatherCard()}</section>${reviewCard}${activityCard}</div></div>`
  );
}
