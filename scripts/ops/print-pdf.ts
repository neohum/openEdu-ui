// Renders a paper (content schema JSON) to A4 PDFs — student and teacher — with headless Chrome,
// then reads the PDFs back to check page count and that answers appear only in the teacher copy.
// Usage: pnpm exec tsx scripts/ops/print-pdf.ts --sample [--repeat N] [--png] [--out dir] [--paper file.json]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { chromium } from "playwright-core";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { paper as paperSchema } from "../../packages/content/src/schema.ts";
import { PrintWorksheet, type PrintMode } from "../../packages/print/src/index.ts";
import { buildCss, buildSurfacesCss, type Surfaces, type Tokens } from "../../packages/tokens/src/build.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

function chromePath(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : undefined,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH to a Chrome/Chromium executable.");
  return found;
}

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));

function loadPaper() {
  const file = flag("sample") ? join(root, "packages/content/src/samples/paper.json") : option("paper");
  if (!file) throw new Error("pass --sample or --paper <file.json>");
  const parsed = paperSchema.parse(json(file));
  const repeat = Number(option("repeat") ?? 1);
  if (repeat <= 1) return parsed;
  const items = Array.from({ length: repeat }, (_, r) => parsed.items.map((it) => ({ ...it, id: `${it.id}-r${r}` }))).flat();
  return { ...parsed, items };
}

function html(body: string): string {
  const css = [
    buildCss(json(join(root, "packages/tokens/src/tokens.json")) as Tokens),
    buildSurfacesCss(json(join(root, "packages/tokens/src/surfaces.json")) as Surfaces),
    readFileSync(join(root, "packages/print/src/print.css"), "utf8"),
  ].join("\n");
  return `<!doctype html><html lang="ko" data-surface="print" data-theme="light"><head><meta charset="utf-8"><style>${css}\nbody{margin:0}</style></head><body>${body}</body></html>`;
}

async function readPdf(file: string) {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    text += content.items.map((i) => ("str" in i ? i.str : "")).join(" ") + "\n";
  }
  return { pages: doc.numPages, text };
}

const outDir = resolve(option("out") ?? join(root, "out/print"));
mkdirSync(outDir, { recursive: true });
const data = loadPaper();
const browser = await chromium.launch({ executablePath: chromePath() });
const summary: Record<string, { file: string; pages: number }> = {};
const texts: Record<string, string> = {};
try {
  for (const mode of ["student", "teacher"] as PrintMode[]) {
    const page = await browser.newPage();
    await page.setContent(html(renderToStaticMarkup(createElement(PrintWorksheet, { paper: data, mode }))));
    const file = join(outDir, `${mode}.pdf`);
    writeFileSync(file, await page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true }));
    if (flag("png")) {
      await page.emulateMedia({ media: "print" });
      await page.setViewportSize({ width: 794, height: 1123 });
      await page.screenshot({ path: join(outDir, `${mode}.png`), fullPage: true });
    }
    await page.close();
    const { pages, text } = await readPdf(file);
    summary[mode] = { file, pages };
    texts[mode] = text;
  }
} finally {
  await browser.close();
}

const failures: string[] = [];
if (/정답|해설/.test(texts.student!)) failures.push("student PDF contains answers or explanations");
if (!/정답/.test(texts.teacher!) || !/해설/.test(texts.teacher!)) failures.push("teacher PDF is missing answers or explanations");
console.log(JSON.stringify({ items: data.items.length, ...summary, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
