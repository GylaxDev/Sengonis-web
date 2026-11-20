/* Modal dialogs: generic forms, confirmation prompts and the post-save flow. */

import { ACTION_LABELS } from "../config.js";
import { $, esc } from "../core/utils.js";
import { ic } from "../core/icons.js";
import { auth } from "../model/auth.js";
import { logAction, save } from "../model/store.js";
import { toast } from "../view/components.js";
import { actionContext } from "./action-context.js";
import { closePalette } from "./palette.js";
import { render } from "./router.js";

export function closeModal() {
  $("#m").innerHTML = "";
}

export function closeAll() {
  closeModal();
  closePalette();
}

/* Save, log the pending action, close the dialog and redraw. */
export function done(message) {
  const last = actionContext.last;
  const label = last && ACTION_LABELS[last.a];
  if (label && auth.current) {
    logAction(label + (last.i ? " #" + last.i : ""), auth.current);
  }

  save();
  closeModal();
  render();
  toast(message || label || "Saved");
}

export function confirmAction(message, onConfirm, yes = "Yes", danger) {
  $("#m").innerHTML = `<div class="mb"><div class="mo" role="dialog" aria-modal="true"><h2>Please confirm</h2><p class="mut" style="margin:0">${esc(
    message,
  )}</p><div class="row"><button class="btn ghost" data-a="close">Cancel</button><button class="btn${
    danger ? " danger" : ""
  }" id="yes">${yes}</button></div></div></div>`;

  $("#yes").focus();
  $("#yes").onclick = () => {
    onConfirm();
    done();
  };
}

export function openForm(title, fields, values, onSubmit) {
  const modal = $("#m");

  const fieldMarkup = fields
    .map(
      (field) =>
        `<label class="fld">${field.l}${
          field.o
            ? `<select name="${field.k}">${field.o
                .map((option) => {
                  const [value, label] = Array.isArray(option)
                    ? option
                    : [option, option];
                  return `<option value="${esc(value)}"${
                    String(value) === String(values[field.k]) ? " selected" : ""
                  }>${esc(label)}</option>`;
                })
                .join("")}</select>`
            : `<input name="${field.k}" type="${field.t || "text"}"${
                field.t === "number"
                  ? ' min="0" step="any" inputmode="decimal"'
                  : ""
              }${field.ph ? ` placeholder="${esc(field.ph)}"` : ""}${
                field.t === "password"
                  ? ' autocomplete="new-password"'
                  : ""
              } value="${esc(values[field.k])}">`
        }${field.hint ? `<small>${field.hint}</small>` : ""}</label>`,
    )
    .join("");

  modal.innerHTML = `<div class="mb"><form class="mo" novalidate role="dialog" aria-modal="true" aria-label="${esc(
    title,
  )}"><div class="mh"><h2>${esc(title)}</h2><button type="button" class="ibtn plain" data-a="close" aria-label="Close">${ic(
    "x",
  )}</button></div>${fieldMarkup}<p class="err"></p><div class="row"><button type="button" class="btn ghost" data-a="close">Cancel</button><button class="btn">Save</button></div></form></div>`;

  const showError = (message) => {
    modal.querySelector(".err").textContent = message;
  };

  const first = modal.querySelector("input,select");
  if (first) first.focus();

  modal.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};

    for (const field of fields) {
      let value = String(formData.get(field.k) ?? "").trim();
      if (!value) {
        showError(field.l + " is required.");
        return;
      }

      if (field.t === "number") {
        value = Number(value);
        if (!isFinite(value) || value < 0 || (field.int && !Number.isInteger(value))) {
          showError(
            field.l +
              (field.int
                ? " must be a whole number of 0 or more."
                : " must be a number of 0 or more."),
          );
          return;
        }
      }

      if (
        (field.t === "date" || field.t === "month") &&
        isNaN(Date.parse(value))
      ) {
        showError(field.l + " must be a valid date.");
        return;
      }

      if (field.min && String(value).length < field.min) {
        showError(field.l + " must be at least " + field.min + " characters.");
        return;
      }

      data[field.k] = value;
    }

    const error = onSubmit(data);
    if (typeof error === "string") showError(error);
  };
}
