/* Login-screen helpers and the signed-in user's account actions. */

import { $ } from "../../core/utils.js";
import { ic } from "../../core/icons.js";
import { auth } from "../auth.js";
import { save } from "../store.js";
import { savePassword, saveProfile } from "../settings.js";
import { render } from "../router.js";
import { logout } from "../session.js";

export const accountActions = {
  out: () => {
    logout();
    render();
  },
  demo: (role) => {
    const form = $("#lf");
    if (!form) return;
    form.querySelector('[name="u"]').value = role;
    form.querySelector('[name="p"]').value = role + "123";
    form.querySelector('[name="p"]').focus();
  },
  eye: () => {
    const field = $("#lf [name=p]");
    const button = $("#lf .pwf button");
    if (!field || !button) return;

    const hidden = field.type === "password";
    field.type = hidden ? "text" : "password";
    button.innerHTML = ic(hidden ? "eye-off" : "eye");
  },
  photo: () => $("#pf")?.click(),
  photox: () => {
    delete auth.current.foto;
    save();
    render();
  },
  profsave: () => saveProfile(),
  pwsave: () => savePassword(),
};
