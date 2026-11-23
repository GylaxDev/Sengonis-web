/* User management (owner only). */

import { esc } from "../../core/utils.js";
import { ic } from "../../core/icons.js";
import { auth } from "../../model/auth.js";
import { state } from "../../model/store.js";
import { ui } from "../../model/ui.js";
import { avatar, btn, exportButton, pageHead, pill, searchField } from "../components.js";
import { dataTable } from "../table.js";

const matchesQuery = (user) =>
  !ui.query ||
  [user.nama, user.username, user.role, user.telp]
    .join(" ")
    .toLowerCase()
    .includes(ui.query.toLowerCase());

export function usersPage() {
  const columns = [
    {
      k: "nama",
      l: "Name",
      h: (user) =>
        `<span class="mini">${avatar(user)}</span>${esc(user.nama)}${
          user.id == auth.current.id ? ' <span class="mut">(you)</span>' : ""
        }`,
    },
    { k: "username", l: "Username" },
    { k: "role", l: "Role" },
    { k: "telp", l: "Phone" },
    {
      k: "aktif",
      l: "Status",
      v: (user) => (user.aktif ? "Active" : "Inactive"),
      h: (user) => pill(user.aktif ? "Active" : "Inactive"),
    },
  ];

  return (
    pageHead(
      "users",
      "Users",
      "Owners approve; field officers record. Deactivated accounts cannot sign in.",
      `<button class="btn" data-a="ua">${ic("user-plus")}Add field officer</button>`,
    ) +
    `<div class="tools"><div class="row">${searchField(
      ui.query,
      "Search users",
    )}</div><div class="row">${exportButton("users")}</div></div>` +
    dataTable("users", columns, state.users.filter(matchesQuery), {
      name: "users",
      icon: "users",
      filtered: !!ui.query,
      act: (user) =>
        `${btn("ue", user.id, "Edit", "ghost")}${
          user.role !== "Owner" && user.aktif
            ? btn("ud", user.id, "Deactivate", "ghost")
            : ""
        }${
          user.role !== "Owner" && !user.aktif
            ? btn("ur", user.id, "Reactivate", "ghost")
            : ""
        }`,
    })
  );
}
