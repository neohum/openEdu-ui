import { describe, expect, it } from "vitest";
import tokens from "../src/tokens.json";
import { buildCss, type Tokens } from "../src/build.ts";

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

const css = buildCss(tokens as unknown as Tokens);
const ids = ["1", "2", "3", "4", "5", "6"] as const;

describe("ink pen palette", () => {
  it("emits --ink-1 … --ink-6 for both themes", () => {
    for (const id of ids) {
      const matches = css.match(new RegExp(`--ink-${id}:`, "g")) ?? [];
      // light :root, dark media query, dark data-theme
      expect(matches).toHaveLength(3);
    }
  });

  describe.each(["light", "dark"] as const)("%s theme", (theme) => {
    const ink = tokens.ink[theme] as Record<string, { $value: string }>;
    const surface = tokens.color[theme].surface.$value;

    it("defines six pens and never uses pure black", () => {
      expect(Object.keys(ink)).toEqual([...ids]);
      for (const id of ids) expect(ink[id]!.$value.toLowerCase()).not.toBe("#000000");
    });

    it.each(ids)("--ink-%s reaches 3:1 against --color-surface", (id) => {
      expect(contrast(ink[id]!.$value, surface)).toBeGreaterThanOrEqual(3);
    });
  });
});
