/* Weather data from Open-Meteo (free, no API key). Raw values are kept in
   metric units; the view converts them using Settings → Preferences. */

import { STORAGE, config } from "../config.js";
import { state } from "./store.js";

let weather = null;
let error = "";
let loading = false;
let lastAttempt = 0;

try {
  weather = JSON.parse(localStorage.getItem(STORAGE.weather));
} catch (parseError) {
  weather = null;
}

export function weatherKey() {
  if (!state || !state.geo) return "";
  return state.geo.c.map((value) => value.toFixed(3)).join(",");
}

export function currentWeather() {
  if (!weather || !state || !state.geo) return null;
  return weather.k === weatherKey() ? weather : null;
}

export function weatherError() {
  return error;
}

export function weatherLoading() {
  return loading;
}

export function clearWeatherCache() {
  try {
    localStorage.removeItem(STORAGE.weather);
  } catch (storageError) {
    /* Ignore storage failures. */
  }
  weather = null;
}

/* Returns [text, level]: 0 fine, 1 caution, 2 danger. Thresholds live in
   Settings → Plantation. */
export function weatherAdvice(data) {
  const current = data.cur;
  const daily = data.daily;
  const rain = daily.precipitation_sum
    .slice(0, 3)
    .reduce((sum, value) => sum + (value || 0), 0);
  const hottest = Math.max(...daily.temperature_2m_max.slice(0, 3));

  if (current.weather_code >= 95 || current.wind_speed_10m >= 40) {
    return [
      "Storm risk: keep crews out of the plantation and check for wind damage afterwards.",
      2,
    ];
  }
  if (
    daily.precipitation_sum[0] >= config.rainMm / 2 ||
    rain >= config.rainMm
  ) {
    return [
      "Heavy rain expected: check drainage in low-lying blocks (waterlogging risk).",
      1,
    ];
  }
  if (rain < 3 && hottest >= config.hotC) {
    return [
      "Hot and dry the next few days: check that seedlings get enough water.",
      1,
    ];
  }
  return ["Conditions look fine for fieldwork.", 0];
}

export async function loadWeather({ force = false } = {}) {
  if (loading || !state || !state.geo) return false;

  const cacheFresh = currentWeather() && Date.now() - weather.at < 9e5;
  if (!force && (Date.now() - lastAttempt < 6e4 || cacheFresh)) return false;

  loading = true;
  if (force) error = "";

  try {
    const [lng, lat] = state.geo.c;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum" +
        "&timezone=auto&forecast_days=4",
    );
    if (!response.ok) throw new Error("Weather request failed");
    const json = await response.json();

    weather = {
      at: Date.now(),
      k: weatherKey(),
      cur: json.current,
      daily: json.daily,
    };
    error = "";
    lastAttempt = 0;

    try {
      localStorage.setItem(STORAGE.weather, JSON.stringify(weather));
    } catch (storageError) {
      /* Ignore storage failures. */
    }
    return true;
  } catch (requestError) {
    error =
      "Could not reach the weather service. Check your internet connection.";
    lastAttempt = Date.now();
    return false;
  } finally {
    loading = false;
  }
}
