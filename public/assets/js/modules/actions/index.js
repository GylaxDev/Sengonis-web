/* The action table behind every [data-a] button. Each function receives the
   button's data-i value, exactly like the original A object. Groups live in
   sibling modules; this file only assembles them and logs the click. */

import { openPalette } from "../palette.js";
import { mapActions } from "../map.js";
import { rememberAction } from "../action-context.js";
import { navigationActions } from "./navigation.js";
import { tableActions } from "./tables.js";
import { accountActions } from "./account.js";
import { preferenceActions } from "./preferences.js";
import { recordActions } from "./records.js";

export const actions = {
  ...navigationActions,
  ...tableActions,
  ...accountActions,
  ...preferenceActions,
  ...recordActions,
  ...mapActions,
  pal: () => openPalette((name, argument) => actions[name]?.(argument)),
};

/* Used by the event layer so a click can be logged with its label. */
export function runAction(name, argument) {
  const action = actions[name];
  if (!action) return;
  rememberAction(name, argument);
  action(argument);
}
