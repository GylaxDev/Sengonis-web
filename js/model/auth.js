/* Authentication and the signed-in user. Sessions store only a user id,
   matching the original demo behaviour (there is no backend). */

import { STORAGE, config } from "../config.js";
import { state } from "./store.js";

let currentUser = null;

export const auth = {
  get current() {
    return currentUser;
  },
  set current(user) {
    currentUser = user;
  },
  isOwner() {
    return !!currentUser && currentUser.role === "Owner";
  },
};

export function readSession() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE.session) ||
        sessionStorage.getItem(STORAGE.session),
    );
  } catch (error) {
    return null;
  }
}

export function writeSession(user) {
  try {
    localStorage.removeItem(STORAGE.session);
    sessionStorage.removeItem(STORAGE.session);
    if (user) {
      const storage = config.keep ? localStorage : sessionStorage;
      storage.setItem(STORAGE.session, JSON.stringify({ id: user.id }));
    }
  } catch (error) {
    /* Ignore storage failures. */
  }
}

export function restoreSession() {
  const saved = readSession();
  if (!saved) return null;
  const user = state.users.find(
    (candidate) => candidate.id == saved.id && candidate.aktif,
  );
  if (user) currentUser = user;
  return currentUser;
}

/* Returns { user } on success or { error } with a message for the login form. */
export function authenticate(username, password) {
  const user = state.users.find(
    (candidate) =>
      candidate.username === username && candidate.password === password,
  );
  if (!user) return { error: "Username or password is incorrect." };
  if (!user.aktif) {
    return {
      error: "This account is deactivated. Ask the owner to reactivate it.",
    };
  }
  return { user };
}

export function signOut() {
  currentUser = null;
  writeSession(null);
}
