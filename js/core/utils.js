/* Small helpers shared by every layer: DOM, formatting, dates and CSV. */

import { config } from "../config.js";

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => [...document.querySelectorAll(selector)];

export function esc(value) {
  return String(value ?? "").replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
  );
}

export const money = (value) =>
  "Rp " + Math.round(value).toLocaleString("id-ID");

/* Compact money for stat tiles: Rp 12.4M */
export function moneyShort(value) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absolute >= 1e9) return sign + "Rp " + (absolute / 1e9).toFixed(1) + "B";
  if (absolute >= 1e6) return sign + "Rp " + (absolute / 1e6).toFixed(1) + "M";
  return money(value);
}

export const nextId = (rows) => Math.max(0, ...rows.map((row) => row.id)) + 1;

export const seededRandom = (seed) => () =>
  (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

export const pad2 = (value) => String(value).padStart(2, "0");

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const iso = (date) =>
  date.getFullYear() +
  "-" +
  pad2(date.getMonth() + 1) +
  "-" +
  pad2(date.getDate());

export function monthOffset(months, day = 15) {
  const date = new Date();
  date.setDate(day);
  date.setMonth(date.getMonth() - months);
  return iso(date);
}

export const today = () => iso(new Date());

/* Dates are stored as ISO (2026-11-18) and formatted on screen
   according to Settings → Date format. */
export function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (config.dateFmt === "id") return `${day}/${month}/${year}`;
  if (config.dateFmt === "en") return `${+day} ${MONTHS[+month - 1]} ${year}`;
  return String(value).slice(0, 10);
}

export function formatMonth(yearMonth) {
  const [year, month] = yearMonth.split("-");
  return config.dateFmt === "iso" ? yearMonth : MONTHS[+month - 1] + " " + year;
}

export function timeAgo(timestamp) {
  const seconds = (Date.now() - new Date(timestamp)) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + " h ago";
  if (seconds < 604800) return Math.floor(seconds / 86400) + " d ago";
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export const monthsOld = (date) =>
  Math.max(0, Math.round((Date.now() - new Date(date)) / 2629800000));

export const formatAge = (months) =>
  months < 12
    ? months + " mo"
    : (months / 12).toFixed(1).replace(/\.0$/, "") + " yr";

export function download(name, text, type) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = name;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 500);
}

export function csvQuote(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export const toCSV = (head, rows) =>
  "\uFEFF" +
  [head, ...rows].map((row) => row.map(csvQuote).join(",")).join("\n");
