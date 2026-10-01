// Fails on values that bypass the design tokens: off-token spacing, font sizes
// and color literals. packages/tokens is the source of truth and is exempt.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export type Violation = { file: string; line: number; rule: string; message: string };

const SPACING_PROPS = /^(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?$|^(?:row-|column-)?gap$|^inset(?:-(?:inline|block)(?:-(?:start|end))?)?$|^(?:top|right|bottom|left)$/;
const DECL = /([a-zA-Z-]+)\s*:\s*["'`]?([^;"'`}\n]*)/g;
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(/;
const LENGTH_LITERAL = /(?<![\w.-])-?\d*\.?\d+(?:px|rem|em|pt)\b/;

const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function lintSource(text: string, file: string): Violation[] {
  const out: Violation[] = [];
  text.split("\n").forEach((lineText, i) => {
    const line = i + 1;
    if (lineText.includes("lint-ignore")) return;
    if (COLOR_LITERAL.test(lineText)) {
      out.push({ file, line, rule: "color-literal", message: "use a --color-* token instead of a color literal" });
    }
    for (const m of lineText.matchAll(DECL)) {
      const prop = kebab(m[1]!);
      const value = m[2]!;
      if (SPACING_PROPS.test(prop) && LENGTH_LITERAL.test(value)) {
        out.push({ file, line, rule: "spacing-literal", message: `"${prop}: ${value.trim()}" — use var(--space-N)` });
      }
      if (prop === "font-size" && LENGTH_LITERAL.test(value)) {
        out.push({ file, line, rule: "font-size-literal", message: `"font-size: ${value.trim()}" — use var(--font-size-*)` });
      }
    }
  });
  return out;
}

const EXTS = new Set([".css", ".ts", ".tsx"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (EXTS.has(name.slice(name.lastIndexOf("."))) && !/\.(test|spec)\./.test(name)) acc.push(path);
  }
  return acc;
}

export function collectFiles(root: string): string[] {
  const files: string[] = [];
  for (const group of ["packages", "apps"]) {
    let pkgs: string[] = [];
    try {
      pkgs = readdirSync(join(root, group));
    } catch {
      continue;
    }
    for (const pkg of pkgs) {
      if (group === "packages" && pkg === "tokens") continue;
      try {
        walk(join(root, group, pkg, "src"), files);
      } catch {
        /* package has no src */
      }
    }
  }
  return files;
}

export function lintRoot(root: string): Violation[] {
  return collectFiles(root).flatMap((f) => lintSource(readFileSync(f, "utf8"), relative(root, f).split(sep).join("/")));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const violations = lintRoot(process.argv[2] ?? process.cwd());
  for (const v of violations) console.error(`${v.file}:${v.line} [${v.rule}] ${v.message}`);
  console.log(violations.length ? `${violations.length} token violation(s)` : "spacing-lint: ok");
  process.exit(violations.length ? 1 : 0);
}
