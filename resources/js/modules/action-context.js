/* Remembers the last clicked action so done() can write the right audit line. */

export const actionContext = { last: null };

export function rememberAction(name, argument) {
  actionContext.last = { a: name, i: argument };
}
