import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { lintSource } from "./spacing-lint.ts";

const script = fileURLToPath(new URL("./spacing-lint.ts", import.meta.url));

function project(css: string, pkg = "react") {
  const root = mkdtempSync(join(tmpdir(), "lint-"));
  mkdirSync(join(root, "packages", pkg, "src"), { recursive: true });
  writeFileSync(join(root, "packages", pkg, "src", "a.css"), css);
  return root;
}
const run = (root: string) => spawnSync(process.execPath, [script, root], { encoding: "utf8" });

test("flags off-token spacing, font size and color literals", () => {
  const v = lintSource(".a { padding: 13px; font-size: 17px; color: #123456; }", "a.css");
  assert.deepEqual(v.map((x) => x.rule).sort(), ["color-literal", "font-size-literal", "spacing-literal"]);
});

test("accepts token-only values and zero", () => {
  const css = ".a { padding: var(--space-4); margin: 0; font-size: var(--font-size-body); color: var(--color-fg); border: 1px solid var(--color-border); }";
  assert.deepEqual(lintSource(css, "a.css"), []);
});

test("catches camelCase inline styles in tsx", () => {
  const v = lintSource('<div style={{ marginTop: "13px" }} />', "a.tsx");
  assert.equal(v[0]?.rule, "spacing-literal");
});

test("lint-ignore comment skips a line", () => {
  assert.deepEqual(lintSource(".a { padding: 13px; } /* lint-ignore */", "a.css"), []);
});

test("CLI exits 1 on violations and 0 on clean source", () => {
  assert.equal(run(project(".a { padding: 13px; }")).status, 1);
  assert.equal(run(project(".a { padding: var(--space-3); }")).status, 0);
});

test("packages/tokens is exempt", () => {
  assert.equal(run(project(".a { color: #fff; }", "tokens")).status, 0);
});
