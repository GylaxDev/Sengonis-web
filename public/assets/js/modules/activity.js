/* Tracks user activity for the optional auto sign-out. */

let lastActivity = Date.now();

export function touch() {
  lastActivity = Date.now();
}

export function idleFor() {
  return Date.now() - lastActivity;
}
