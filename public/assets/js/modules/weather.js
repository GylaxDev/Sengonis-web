/* Fetches weather and repaints every weather card and the bell badge. */

import { auth } from "./auth.js";
import { loadWeather } from "./weather-data.js";
import { paintBell } from "../views/layout.js";
import { paintWeather } from "../views/weather.js";

export async function refreshWeather({ force = false } = {}) {
  await loadWeather({ force });
  paintWeather();
  paintBell();
}

setInterval(() => {
  if (auth.current) refreshWeather();
}, 9e5);
