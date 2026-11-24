/* Sign-in screen. */

import { config } from "../core/config.js";
import { esc } from "../core/utils.js";
import { ic } from "../core/icons.js";
import { state } from "../modules/store.js";
import { logo } from "./components.js";

export function loginView(session) {
  const living = state.tan.filter((plant) => plant.st !== "Dead").length;

  return `<div class="lg"><header class="lgh"><div class="brand" style="cursor:default">${logo()}<span class="wm">sengonis</span></div><button class="ibtn" data-a="theme2" aria-label="Toggle dark mode">${ic(
    "moon",
  )}</button></header>
  <div class="lgb"><div class="lgt"><p class="eye">Sengonis is for Forest Keepers</p><h1>Growing what lasts, one sengon at a time</h1><p class="sub">Track every tree, every rupiah and every risk across your plantation, with a live 3D map and forecasts that help you act early.</p></div>
  <div class="lgart"><form id="lf" class="card lform" novalidate><h2>Sign in</h2><label class="fld">Username<input name="u" autocomplete="username" autocapitalize="none" value="${esc(
    session.lastUser,
  )}" autofocus></label><label class="fld">Password<span class="pwf"><input name="p" type="password" autocomplete="current-password"><button type="button" data-a="eye" aria-label="Show password">${ic(
    "eye",
  )}</button></span></label><p class="err" role="alert">${esc(
    session.error,
  )}</p><button class="btn" style="width:100%;padding-block:13px">Sign in</button>
  <div class="demo"><span class="mut" style="font-size:.82rem;align-self:center">Demo:</span><button type="button" class="chip" data-a="demo" data-i="owner">${ic(
    "shield-check",
  )}Owner</button><button type="button" class="chip" data-a="demo" data-i="officer">${ic(
    "hard-hat",
  )}Field officer</button></div>
  <button type="button" class="btn ghost sm" data-a="rst" style="justify-self:start">Forgot login? Reset demo data</button></form>
  <div class="lfloat"><div class="top"><span class="pill ok">Live</span><span>${esc(
    config.plantName,
  )}</span></div><b>${living} living trees tracked</b><small class="mut">${
    state.geo.b.length
  } blocks · 3D map · weather</small></div></div></div></div>`;
}
