/* Simple bar chart rendered as inline SVG. */

import { MONTHS, esc } from "../core/utils.js";

export function barChart(values, labels, formatTooltip) {
  const width = 440;
  const height = 150;
  const top = 10;
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const y = (value) => top + ((max - value) / span) * (height - top);
  const barWidth = width / Math.max(1, values.length);
  const zero = y(0);

  const grid = [0, 0.5, 1]
    .map(
      (position) =>
        `<line class="gl" x1="0" x2="${width}" y1="${
          top + position * (height - top)
        }" y2="${top + position * (height - top)}"/>`,
    )
    .join("");

  return `<svg class="ch" viewBox="0 0 ${width} ${
    height + 18
  }" role="img" aria-label="Bar chart">${grid}<line class="z" x1="0" x2="${width}" y1="${zero}" y2="${zero}"/>${values
    .map(
      (value, index) =>
        `<rect class="b${value < 0 ? " neg" : ""}" style="animation-delay:${
          index * 45
        }ms" x="${index * barWidth + barWidth * 0.2}" width="${
          barWidth * 0.6
        }" y="${Math.min(y(value), zero)}" height="${Math.max(
          2,
          Math.abs(y(value) - zero),
        )}" rx="${Math.min(7, barWidth * 0.3)}"><title>${esc(
          labels[index],
        )}: ${esc(formatTooltip(value))}</title></rect><text x="${
          index * barWidth + barWidth / 2
        }" y="${height + 14}" text-anchor="middle">${
          MONTHS[+labels[index].slice(5) - 1]
        }</text>`,
    )
    .join("")}</svg>`;
}
