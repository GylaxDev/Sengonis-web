/* Sign-in state that the login view needs to keep between renders. */

import { config } from "../core/config.js";
import { auth, authenticate, signOut, writeSession } from "../model/auth.js";
import { ui } from "../model/ui.js";
import { shortName, toast } from "../view/components.js";
import { touch } from "./activity.js";

export const sessionView = { lastUser: "", error: "" };

export function attemptLogin(username, password) {
  sessionView.lastUser = username;

  const result = authenticate(username, password);
  if (result.error) {
    sessionView.error = result.error;
    return false;
  }

  auth.current = result.user;
  sessionView.error = "";
  sessionView.lastUser = "";
  ui.view =
    config.landing === "users" && !auth.isOwner() ? "home" : config.landing;
  ui.animate = true;
  writeSession(auth.current);
  touch();
  toast("Welcome back, " + shortName(auth.current));
  return true;
}

/* Passing a message is used by the auto sign-out timer. */
export function logout(message) {
  signOut();
  if (message != null) sessionView.error = message;
  ui.animate = true;
}
