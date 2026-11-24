/* User accounts. */

import { state } from "./store.js";
import { nextId } from "../core/utils.js";

export const users = {
  all() {
    return state.users;
  },

  byId(id) {
    return state.users.find((user) => user.id == id);
  },

  findByUsername(username) {
    return state.users.find((user) => user.username === username);
  },

  usernameTaken(username, exceptId = null) {
    return state.users.some(
      (user) => user.id != exceptId && user.username === username,
    );
  },

  add(data) {
    const user = {
      id: nextId(state.users),
      role: "Field Officer",
      ...data,
      aktif: true,
    };
    state.users.push(user);
    return user;
  },

  update(id, data) {
    const user = this.byId(id);
    if (!user) return null;
    Object.assign(user, data, { aktif: data.aktif === "1" });
    return user;
  },

  setActive(id, active) {
    const user = this.byId(id);
    if (user) user.aktif = active;
    return user;
  },
};
