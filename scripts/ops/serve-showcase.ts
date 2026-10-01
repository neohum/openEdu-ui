// Minimal production-like static server for the built showcase: negotiated zstd/br/gzip compression,
// long-lived caching for hashed assets, 1-day caching for other static files, SPA fallback.
// Usage: pnpm exec tsx scripts/ops/serve-showcase.ts [--port 4173] [--dir apps/showcase/dist]
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".svg", ".json", ".webmanifest"]);
const DAY = 86400;

export function startServer(dir: string, port = 0): Promise<{ server: Server; port: number }> {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let file = normalize(join(root, decodeURIComponent(url.pathname)));
    if (file !== root && !file.startsWith(root + sep)) return void res.writeHead(403).end();
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, "index.html");

    const ext = extname(file);
    const hashed = url.pathname.startsWith("/assets/");
    const cache = ext === ".html" ? "no-cache" : `public, max-age=${hashed ? 365 * DAY : DAY}${hashed ? ", immutable" : ""}`;
    const headers: Record<string, string | number> = { "Content-Type": TYPES[ext] ?? "application/octet-stream", "Cache-Control": cache, Vary: "Accept-Encoding" };
    let body: Buffer = readFileSync(file);

    if (COMPRESSIBLE.has(ext)) {
      const accept = String(req.headers["accept-encoding"] ?? "");
      if (accept.includes("zstd")) { body = zlib.zstdCompressSync(body); headers["Content-Encoding"] = "zstd"; }
      else if (accept.includes("br")) { body = zlib.brotliCompressSync(body); headers["Content-Encoding"] = "br"; }
      else if (accept.includes("gzip")) { body = zlib.gzipSync(body); headers["Content-Encoding"] = "gzip"; }
    }
    headers["Content-Length"] = body.length;
    res.writeHead(200, headers).end(req.method === "HEAD" ? undefined : body);
  });
  return new Promise((ok) => server.listen(port, () => ok({ server, port: (server.address() as { port: number }).port })));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (n: string) => process.argv[process.argv.indexOf(`--${n}`) + 1];
  const { port } = await startServer(process.argv.includes("--dir") ? arg("dir")! : "apps/showcase/dist", process.argv.includes("--port") ? Number(arg("port")) : 4173);
  console.log(`showcase on http://localhost:${port}`);
}
