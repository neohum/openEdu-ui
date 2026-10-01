import { describe, expect, it } from "vitest";
import tokens from "../src/tokens.json";
import { buildCss, type Tokens } from "../src/build.ts";

const css = buildCss(tokens as unknown as Tokens);

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("tokens.css", () => {
  it("emits semantic color, space and type variables", () => {
    for (const name of ["--color-bg", "--color-fg", "--color-accent", "--font-size-body", "--space-unit"]) {
      expect(css).toContain(`${name}:`);
    }
    for (let n = 1; n <= 12; n++) expect(css).toContain(`--space-${n}: calc(var(--space-unit) * ${n});`);
  });

  it("defines dark theme via media query and data-theme", () => {
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(':root[data-theme="dark"]');
  });
});

describe.each(["light", "dark"] as const)("%s palette", (theme) => {
  const c = Object.fromEntries(
    Object.entries(tokens.color[theme]).map(([k, v]) => [k, v.$value]),
  ) as Record<string, string>;

  it("never uses pure black", () => {
    expect(Object.values(c)).not.toContain("#000000");
  });

  it.each([
    ["fg", "bg"],
    ["fg", "surface"],
    ["fg-muted", "bg"],
    ["fg-muted", "surface"],
    ["accent-fg", "accent"],
    ["danger-fg", "danger"],
    ["accent", "bg"],
  ])("%s on %s meets WCAG AA (4.5:1)", (fg, bg) => {
    expect(contrast(c[fg]!, c[bg]!)).toBeGreaterThanOrEqual(4.5);
  });
});
