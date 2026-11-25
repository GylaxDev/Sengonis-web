import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pairs = [
  ["resources/js", "public/assets/js"],
  ["resources/css", "public/assets/css"],
];

for (const [source, destination] of pairs) {
  const from = path.join(root, source);
  const to = path.join(root, destination);
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
}

console.log("Synced resources/js and resources/css into public/assets");
