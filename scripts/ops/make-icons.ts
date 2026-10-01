// Exports raster icons from the authored SVGs (the SVG is the source of truth).
// Usage: pnpm exec tsx scripts/ops/make-icons.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const pub = resolve(dirname(fileURLToPath(import.meta.url)), "../../apps/showcase/public");
const svg = readFileSync(join(pub, "favicon.svg"), "utf8");
const chrome = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
if (!chrome) throw new Error("Chrome not found. Set CHROME_PATH.");

const browser = await chromium.launch({ executablePath: chrome });
async function png(size: number, bg?: string): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const bgStyle = bg ? `background:${bg}` : `background:transparent`;
  await page.setContent(`<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;${bgStyle}">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
  const buf = await page.screenshot({ omitBackground: !bg, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  return buf;
}

try {
  writeFileSync(join(pub, "app-icon.png"), await png(512));
  writeFileSync(join(pub, "icon-192.png"), await png(192));
  writeFileSync(join(pub, "apple-touch-icon.png"), await png(180, "#f8fafc"));
  // ICO container holding one 32x32 PNG image.
  const img = await png(32);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(img.length, 14); header.writeUInt32LE(22, 18);
  writeFileSync(join(pub, "favicon.ico"), Buffer.concat([header, img]));
  writeFileSync(join(pub, "manifest.webmanifest"), JSON.stringify({
    name: "openEdu-ui", short_name: "openEdu-ui", lang: "ko", start_url: "/", display: "standalone",
    background_color: "#f8fafc", theme_color: "#2f4fd0",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/app-icon.png", sizes: "512x512", type: "image/png" }],
  }, null, 2) + "\n");
} finally {
  await browser.close();
}
console.log("icons written to", pub);
