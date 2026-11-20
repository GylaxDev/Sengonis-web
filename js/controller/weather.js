/* Fetches weather and repaints every weather card and the bell badge. */

import { auth } from "../model/auth.js";
import { loadWeather } from "../model/weather.js";
import { paintBell } from "../view/layout.js";
import { paintWeather } from "../view/weather.js";

export async function refreshWeather({ force = false } = {}) {
  await loadWeather({ force });
  paintWeather();
  paintBell();
}

setInterval(() => {
  if (auth.current) refreshWeather();
}, 9e5);
