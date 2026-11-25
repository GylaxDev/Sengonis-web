/* Shared view pieces: buttons, headings, avatars, artwork and toasts. */

import { BUTTON_ICONS, ic } from "../core/icons.js";
import { esc } from "../core/utils.js";

export const logo = () => `<span class="logo">${ic("trees")}</span>`;

export const btn = (action, id, label, className = "") =>
  `<button class="btn sm ${className}" data-a="${action}" data-i="${id}">${ic(BUTTON_ICONS[label])}${label}</button>`;

export function pill(status) {
  const tone = /Validated|Verified|Active|Mature|^Paid/.test(status)
    ? "ok"
    : /Rejected|Dead|Inactive/.test(status)
      ? "no"
      : /Pending|Draft|Unpaid/.test(status)
        ? "wait"
        : /Seedling/.test(status)
          ? "inf"
          : "";
  return `<span class="pill ${tone}">${esc(status)}</span>`;
}

export const pageHead = (icon, title, subtitle, actions = "") =>
  `<div class="ph"><div><h1>${ic(icon)}${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div><div class="row">${actions}</div></div>`;

/* The search box is rendered with the current query. */
export function searchField(query, placeholder = "Search") {
  return `<span class="search">${ic("search")}<input data-q placeholder="${esc(
    placeholder,
  )}" value="${esc(query)}" aria-label="Search"></span>`;
}

export const selectBox = (value, stateKey, options) =>
  `<select data-s="${stateKey}" aria-label="${stateKey}">${options
    .map((option) => {
      const [optionValue, label] = Array.isArray(option)
        ? option
        : [option, option];
      return `<option value="${esc(optionValue)}"${
        String(optionValue) === String(value) ? " selected" : ""
      }>${esc(label)}</option>`;
    })
    .join("")}</select>`;

export const exportButton = (tableId) =>
  `<button class="btn ghost" data-a="csv" data-i="${tableId}">${ic("download")}Export CSV</button>`;

export function initials(name) {
  return String(name)
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
}

export const avatar = (user) =>
  user.foto
    ? `<img src="${esc(user.foto)}" alt="">`
    : esc(initials(user.nama));

export function shortName(user) {
  const parts = user.nama.split(" ");
  return /^(bu|pak|ibu|bapak)$/i.test(parts[0]) && parts[1]
    ? parts[0] + " " + parts[1]
    : parts[0];
}

/* Soft yellow / blue-grey / taupe circles, used by the dashboard hero. */
export const art = () =>
  `<svg class="art" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="blr" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter></defs><rect width="600" height="400" fill="var(--artbg)"/><g filter="url(#blr)"><circle cx="140" cy="270" r="150" fill="var(--acc)"/><circle cx="340" cy="140" r="170" fill="var(--acc)" opacity=".92"/><circle cx="470" cy="310" r="140" fill="var(--blue)"/><circle cx="580" cy="110" r="110" fill="var(--acc)"/><circle cx="290" cy="380" r="110" fill="var(--taupe)"/></g><g fill="none" stroke="#fffaf0" stroke-width="2" opacity=".95"><circle cx="340" cy="210" r="150"/><circle cx="165" cy="310" r="115" stroke-dasharray="5 7"/><path d="M30 370C170 130 330 80 470 70"/></g><g fill="#fffaf0"><circle cx="470" cy="70" r="6"/><circle cx="30" cy="370" r="6"/></g></svg>`;

export function toast(message, kind = "") {
  const element = document.createElement("div");
  element.className = "toast " + kind;
  element.innerHTML =
    ic(kind === "bad" ? "circle-alert" : "circle-check") +
    `<span>${esc(message)}</span>`;
  document.getElementById("toasts").appendChild(element);

  setTimeout(() => {
    element.style.transition = "opacity .3s";
    element.style.opacity = 0;
    setTimeout(() => element.remove(), 320);
  }, 2800);
}
