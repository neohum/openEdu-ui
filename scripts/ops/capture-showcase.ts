// Tier-3 check for the showcase: serves the production build, opens it in real Chrome on each surface,
// saves a screenshot per surface and verifies loading, caching, compression, preloads, icons and touch targets.
// Usage: pnpm --filter showcase build && pnpm exec tsx scripts/ops/capture-showcase.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { startServer } from "./serve-showcase.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dist = join(root, "apps/showcase/dist");
if (!existsSync(join(dist, "index.html"))) throw new Error("apps/showcase/dist missing — run `pnpm --filter showcase build` first");
const chrome = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
if (!chrome) throw new Error("Chrome not found. Set CHROME_PATH.");

const SURFACES = [
  { name: "board", width: 1920, height: 1080, minTarget: 64 },
  { name: "desktop", width: 1440, height: 900, minTarget: 44 },
  { name: "mobile", width: 390, height: 844, minTarget: 48 },
  { name: "print", width: 794, height: 1123, minTarget: 0 },
] as const;

const outDir = join(root, "screenshots");
mkdirSync(join(root, "out"), { recursive: true });
mkdirSync(outDir, { recursive: true });
const { server, port } = await startServer(dist);
const browser = await chromium.launch({ executablePath: chrome });
const failures: string[] = [];
const report: Record<string, unknown> = {};

try {
  for (const s of SURFACES) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    // tsx (esbuild keepNames) wraps helpers in __name(); the browser context needs a stub for serialized callbacks
    await page.addInitScript("window.__name = (f) => f;");
    const bad: string[] = [];
    const responses: { url: string; status: number; encoding?: string; cache?: string }[] = [];
    page.on("console", (m) => m.type() === "error" && bad.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => bad.push(`pageerror: ${e.message}`));
    page.on("response", (r) => responses.push({ url: r.url(), status: r.status(), encoding: r.headers()["content-encoding"], cache: r.headers()["cache-control"] }));

    await page.goto(`http://localhost:${port}/?surface=${s.name}&theme=light`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    if (s.name === "print") await page.emulateMedia({ media: "print" });

    const checks = await page.evaluate((minTarget) => {
      const rect = (el: Element) => el.getBoundingClientRect();
      const interactive = [...document.querySelectorAll<HTMLElement>("button, [role=slider], select, summary, input:not([type=radio]):not([type=checkbox])")]
        .filter((el) => rect(el).width > 0 && !el.closest("[hidden]"));
      const small = interactive
        .filter((el) => Math.min(rect(el).width, rect(el).height) < minTarget - 0.5)
        .map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 12)}] ${Math.round(rect(el).width)}x${Math.round(rect(el).height)}`);
      const logo = document.querySelector<HTMLImageElement>("img.sc-logo");
      return {
        surfaceAttr: document.documentElement.dataset.surface,
        bodyFontPx: parseFloat(getComputedStyle(document.body).fontSize),
        iconFontLoaded: document.fonts.check("16px uicons-regular-rounded"),
        logoLoaded: !!logo && logo.naturalWidth > 0,
        faviconLink: !!document.querySelector('link[rel="icon"]'),
        preloadFont: !!document.querySelector('link[rel="preload"][as="font"]'),
        preloadStyle: !!document.querySelector('link[rel="preload"][as="style"]'),
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        interactiveCount: interactive.length,
        small,
      };
    }, s.minTarget);

    // First screen as a user sees it (fixed dock included), then the whole page without the fixed dock
    // (a full-page capture would paint the dock in the middle of the document).
    await page.screenshot({ path: join(outDir, `${s.name}.png`) });
    await page.addStyleTag({ content: ".oe-dock { display: none !important; }" });
    await page.screenshot({ path: join(outDir, `${s.name}-full.png`), fullPage: true });

    const js = responses.find((r) => /\/assets\/.*\.js$/.test(r.url));
    const maxAge = Number(/max-age=(\d+)/.exec(js?.cache ?? "")?.[1] ?? 0);
    if (checks.surfaceAttr !== s.name) failures.push(`${s.name}: data-surface is ${checks.surfaceAttr}`);
    if (!checks.iconFontLoaded) failures.push(`${s.name}: icon font not loaded`);
    if (!checks.logoLoaded) failures.push(`${s.name}: logo not loaded`);
    if (!checks.faviconLink) failures.push(`${s.name}: favicon link missing`);
    if (!checks.preloadFont || !checks.preloadStyle) failures.push(`${s.name}: preload links missing (font=${checks.preloadFont}, style=${checks.preloadStyle})`);
    if (!js?.encoding) failures.push(`${s.name}: JS served without compression`);
    if (maxAge < 86400) failures.push(`${s.name}: JS cache max-age ${maxAge} < 1 day`);
    for (const r of responses.filter((x) => x.status >= 400)) failures.push(`${s.name}: ${r.status} ${r.url}`);
    for (const b of bad) failures.push(`${s.name}: ${b}`);
    if (checks.horizontalOverflow > 0) failures.push(`${s.name}: page overflows horizontally by ${checks.horizontalOverflow}px`);
    if (checks.small.length) failures.push(`${s.name}: ${checks.small.length} touch target(s) under ${s.minTarget}px: ${checks.small.slice(0, 5).join("; ")}`);
    report[s.name] = { ...checks, small: checks.small.length, jsEncoding: js?.encoding, jsCache: js?.cache };
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

writeFileSync(join(root, "out", "showcase-report.json"), JSON.stringify({ report, failures }, null, 2));
console.log(JSON.stringify({ report, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
