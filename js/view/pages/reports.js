/* Financial and mortality reports, plus the owner-only audit trail. */

import { formatDate, formatMonth, money } from "../../core/utils.js";
import { ic } from "../../core/icons.js";
import { auth } from "../../model/auth.js";
import { state } from "../../model/store.js";
import { ui } from "../../model/ui.js";
import {
  deathsByCause,
  financialReports,
  mortalityReports,
} from "../../model/reports.js";
import { btn, exportButton, pageHead, pill } from "../components.js";
import { dataTable } from "../table.js";

function reportTabs() {
  const tabs = [
    ["fin", "Financial reports", "wallet"],
    ["dead", "Mortality reports", "triangle-alert"],
  ];
  if (auth.isOwner()) tabs.push(["log", "Audit trail", "history"]);

  return `<div class="row noprint">${tabs
    .map(
      (tab) =>
        `<button class="chip" data-a="tab" data-i="${tab[0]}" aria-pressed="${
          ui.tab === tab[0]
        }">${ic(tab[2])}${tab[1]}</button>`,
    )
    .join("")}</div>`;
}

function archiveToggle() {
  return `<label class="row" style="gap:8px;font-size:.9rem;cursor:pointer"><span class="sw"><input type="checkbox" data-s="ARCH"${
    ui.showArchived ? " checked" : ""
  }><span></span></span>Show archived</label>`;
}

function printButton() {
  return `<button class="btn ghost" data-a="print">${ic("printer")}Print</button>`;
}

function auditTrail() {
  const columns = [
    {
      k: "t",
      l: "Time",
      h: (entry) =>
        new Date(entry.t).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    { k: "u", l: "User" },
    { k: "x", l: "Action" },
  ];

  return (
    `<div class="tools"><p class="mut" style="margin:0">Who changed what, newest first (last 300 actions).</p><div class="row">${exportButton(
      "log",
    )}</div></div>` +
    dataTable("log", columns, state.log, {
      name: "audit-trail",
      icon: "history",
      empty: "No activity recorded yet.",
    })
  );
}

function financialTab() {
  const rows = financialReports
    .all()
    .filter(
      (report) =>
        !!report.arsip === ui.showArchived &&
        (!ui.reportFrom || report.periode >= ui.reportFrom) &&
        (!ui.reportTo || report.periode <= ui.reportTo),
    );

  const tools = `<div class="tools"><div class="row">${archiveToggle()}<label class="fld" style="grid-auto-flow:column;align-items:center;gap:8px">From<input type="month" data-s="RF" value="${
    ui.reportFrom
  }"></label><label class="fld" style="grid-auto-flow:column;align-items:center;gap:8px">To<input type="month" data-s="RT" value="${
    ui.reportTo
  }"></label></div><div class="row">${printButton()}${exportButton(
    "fin",
  )}${
    auth.isOwner()
      ? ""
      : `<button class="btn" data-a="la">${ic("plus")}New report</button>`
  }</div></div>`;

  const columns = [
    {
      k: "periode",
      l: "Period",
      v: (report) => report.periode,
      h: (report) => formatMonth(report.periode),
    },
    {
      k: "masuk",
      l: "Income",
      v: (report) => report.masuk,
      h: (report) => money(report.masuk),
      r: 1,
    },
    {
      k: "keluar",
      l: "Expenses",
      v: (report) => report.keluar,
      h: (report) => money(report.keluar),
      r: 1,
    },
    {
      k: "net",
      l: "Net",
      v: (report) => report.masuk - report.keluar,
      h: (report) =>
        `<span class="${
          report.masuk < report.keluar ? "neg" : "pos"
        }">${money(report.masuk - report.keluar)}</span>`,
      r: 1,
    },
    { k: "status", l: "Status", h: (report) => pill(report.status) },
  ];

  return (
    tools +
    dataTable("fin", columns, rows, {
      name: "financial-reports",
      icon: "file-text",
      empty: "No financial reports in this range.",
      act: (report) =>
        `${
          report.status === "Draft"
            ? btn("le", report.id, "Edit", "ghost") +
              (auth.isOwner() ? btn("lv", report.id, "Verify") : "")
            : ""
        }${
          auth.isOwner() && report.status === "Verified" && !report.arsip
            ? btn("lz", report.id, "Archive", "ghost")
            : ""
        }`,
    })
  );
}

function mortalityTab() {
  const causes = deathsByCause();
  const maximum = Math.max(1, ...Object.values(causes));
  const rows = mortalityReports
    .all()
    .filter((report) => !!report.arsip === ui.showArchived);

  const causesCard = `<section class="card"><div class="ch-h"><h2>Causes of death<small>Trees lost, all reports</small></h2></div>${
    Object.entries(causes)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([cause, count]) =>
          `<div class="hz"><span>${cause}</span><div class="t"><i style="width:${
            (count / maximum) * 100
          }%"></i></div><span>${count}</span></div>`,
      )
      .join("") || `<p class="mut" style="margin:0">No deaths recorded.</p>`
  }</section>`;

  const tools = `<div class="tools"><div class="row">${archiveToggle()}</div><div class="row">${printButton()}${exportButton(
    "dead",
  )}${
    auth.isOwner()
      ? ""
      : `<button class="btn" data-a="da">${ic("plus")}New report</button>`
  }</div></div>`;

  const columns = [
    { k: "tgl", l: "Date", h: (report) => formatDate(report.tgl) },
    { k: "tid", l: "Plant", v: (report) => report.tid, h: (report) => "Plant " + report.tid },
    { k: "jumlah", l: "Trees dead", v: (report) => report.jumlah, r: 1 },
    { k: "penyebab", l: "Cause" },
    { k: "status", l: "Status", h: (report) => pill(report.status) },
  ];

  return (
    causesCard +
    tools +
    dataTable("dead", columns, rows, {
      name: "mortality-reports",
      icon: "triangle-alert",
      empty: "No mortality reports.",
      act: (report) =>
        `${
          report.status === "Draft"
            ? btn("de", report.id, "Edit", "ghost") +
              (auth.isOwner() ? btn("dv", report.id, "Verify") : "")
            : ""
        }${
          auth.isOwner() && report.status === "Verified" && !report.arsip
            ? btn("dz", report.id, "Archive", "ghost")
            : ""
        }`,
    })
  );
}

export function reportsPage() {
  let body;
  if (ui.tab === "log" && auth.isOwner()) body = auditTrail();
  else if (ui.tab === "fin") body = financialTab();
  else body = mortalityTab();

  return (
    pageHead(
      "report",
      "Reports",
      "Monthly financial and mortality reports, verified by the owner.",
    ) + reportTabs() + body
  );
}
