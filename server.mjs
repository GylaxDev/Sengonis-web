/* Cross-platform static server for the SPA.
   No hardcoded paths: works from any folder on Linux, macOS or Windows. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const fallback = path.join(publicDir, "index.html");
const port = Number(process.env.PORT || 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function send(res, file, status = 200) {
  res.writeHead(status, {
    "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname,
    );
    const file = path.resolve(publicDir, "." + pathname);

    if (!file.startsWith(publicDir)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      send(res, file);
      return;
    }

    // SPA fallback: /settings?section=appearance etc. all load index.html.
    send(res, fallback);
  })
  .listen(port, () => {
    console.log(`Sengonis running at http://localhost:${port}`);
  });
