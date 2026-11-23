/* Weather card shown on the dashboard and the map page. */

import { config } from "../core/config.js";
import { ic } from "../core/icons.js";
import {
  currentWeather,
  weatherAdvice,
  weatherError,
} from "../model/weather.js";

const WEATHER_CODES = {};
[
  [[0], "Clear sky", "sun", "moon"],
  [[1], "Mainly clear", "sun", "moon"],
  [[2], "Partly cloudy", "cloud-sun", "cloud-moon"],
  [[3], "Overcast", "cloud"],
  [[45, 48], "Fog", "cloud-fog"],
  [[51, 53, 55, 56, 57], "Drizzle", "cloud-drizzle"],
  [[61, 63, 65, 66, 67], "Rain", "cloud-rain"],
  [[80, 81, 82], "Rain showers", "cloud-rain"],
  [[71, 73, 75, 77, 85, 86], "Snow", "cloud-snow"],
  [[95, 96, 99], "Thunderstorm", "cloud-lightning"],
].forEach(([codes, ...values]) =>
  codes.forEach((code) => (WEATHER_CODES[code] = values)),
);

function weatherInfo(code, day = 1) {
  const info = WEATHER_CODES[code] || ["Cloudy", "cloud"];
  return [info[0], !day && info[2] ? info[2] : info[1]];
}

const temperature = (celsius) =>
  config.tempUnit === "F" ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
const temperatureUnit = () => "°" + config.tempUnit;
const wind = (kmh) =>
  config.windUnit === "mph" ? Math.round(kmh * 0.621) : Math.round(kmh);
const windUnit = () => (config.windUnit === "mph" ? "mph" : "km/h");

export function weatherCard() {
  const weather = currentWeather();

  if (!weather) {
    const error = weatherError();
    return `<div class="wxh"><div><span class="eye">Weather at the plantation</span><div class="wxt">${
      error ? "Unavailable" : "Loading…"
    }</div></div><i class="tic">${ic(
      "cloud-sun",
    )}</i></div><p class="mut" style="margin-top:8px">${
      error || "Fetching the latest forecast."
    }</p>${
      error
        ? `<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="wxr">${ic(
            "refresh-cw",
          )}Try again</button></div>`
        : ""
    }`;
  }

  const current = weather.cur;
  const daily = weather.daily;
  const [label, icon] = weatherInfo(current.weather_code, current.is_day);
  const dayName = (index) =>
    index
      ? new Date(daily.time[index] + "T12:00:00").toLocaleDateString("en-GB", {
          weekday: "short",
        })
      : "Today";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const direction =
    directions[Math.round(current.wind_direction_10m / 45) % 8];
  const [advice, level] = weatherAdvice(weather);

  return `<div class="wxh"><div><span class="eye">Weather at the plantation</span><div class="wxt">${temperature(
    current.temperature_2m,
  )}${temperatureUnit()}<small>${label}</small></div></div><i class="tic">${ic(
    icon,
  )}</i></div>` +
    `<p class="mut" style="margin-top:6px;font-size:.88rem">Feels like ${temperature(
      current.apparent_temperature,
    )}°, humidity ${current.relative_humidity_2m}%, wind ${wind(
      current.wind_speed_10m,
    )} ${windUnit()} ${direction}, rain now ${current.precipitation} mm</p>` +
    `<div class="fc">${daily.time
      .map(
        (_, index) =>
          `<div><span>${dayName(index)}</span>${ic(
            weatherInfo(daily.weather_code[index])[1],
          )}<b>${temperature(daily.temperature_2m_min[index])}–${temperature(
            daily.temperature_2m_max[index],
          )}°</b><span>${Math.round(
            daily.precipitation_sum[index],
          )} mm</span></div>`,
      )
      .join("")}</div>` +
    `<div class="adv ${["", "w", "b"][level]}">${ic(
      level ? "triangle-alert" : "circle-check",
    )}<span>${advice}</span></div><small class="up">Updated ${new Date(
      weather.at,
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })}${
      weatherError()
        ? ". Could not refresh, showing the last forecast."
        : ""
    } · Open-Meteo <button class="btn sm ghost" data-a="wxr" style="margin-left:8px" aria-label="Refresh weather">${ic(
      "refresh-cw",
    )}</button></small>`;
}

export function paintWeather() {
  document
    .querySelectorAll("[data-wx]")
    .forEach((element) => (element.innerHTML = weatherCard()));
}
