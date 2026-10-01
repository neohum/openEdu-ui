import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");
const chrome = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].some((p) => p && existsSync(p));

function run(args: string[]) {
  const out = mkdtempSync(join(tmpdir(), "print-"));
  const r = spawnSync("pnpm", ["exec", "tsx", "scripts/ops/print-pdf.ts", "--sample", "--out", out, ...args], { cwd: root, encoding: "utf8" });
  return { status: r.status, summary: JSON.parse(r.stdout.slice(r.stdout.indexOf("{"))) as { items: number; student: { pages: number }; teacher: { pages: number }; failures: string[] } };
}

// Needs a local Chrome/Chromium (set CHROME_PATH); skipped, not passed, when none is installed.
describe.skipIf(!chrome)("print-pdf (real Chrome)", () => {
  it("produces A4 PDFs for the sample paper without leaking answers", () => {
    const { status, summary } = run([]);
    expect(status).toBe(0);
    expect(summary.failures).toEqual([]);
    expect(summary.student.pages).toBeGreaterThanOrEqual(1);
    expect(summary.teacher.pages).toBeGreaterThanOrEqual(summary.student.pages);
  }, 60_000);

  it("paginates a longer paper onto several pages", () => {
    const { status, summary } = run(["--repeat", "4"]);
    expect(status).toBe(0);
    expect(summary.items).toBe(24);
    expect(summary.student.pages).toBeGreaterThanOrEqual(3);
  }, 60_000);
});
