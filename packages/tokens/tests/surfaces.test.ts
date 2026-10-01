import { describe, expect, it } from "vitest";
import surfaces from "../src/surfaces.json";
import { buildSurfacesCss, type Surfaces } from "../src/build.ts";

const profiles = surfaces.surface as Record<string, Record<string, string | number>>;
const css = buildSurfacesCss(surfaces as Surfaces);
const px = (v: string | number | undefined) => parseFloat(String(v));
const bodyPt = (name: string) => 16 * Number(profiles[name]!["font-scale"]) * 0.75;

describe("surface profiles", () => {
  it("defines the four surfaces", () => {
    expect(Object.keys(profiles).sort()).toEqual(["board", "desktop", "mobile", "print"]);
  });

  it("board meets provisional distance-legibility floors (body >= 28pt, target >= 64px)", () => {
    expect(bodyPt("board")).toBeGreaterThanOrEqual(28);
    expect(px(profiles.board!["target-min"])).toBeGreaterThanOrEqual(64);
    expect(px(profiles.board!["target-comfortable"])).toBeGreaterThanOrEqual(80);
  });

  it.each(["desktop", "mobile"])("%s targets are at least 44px", (name) => {
    expect(px(profiles[name]!["target-min"])).toBeGreaterThanOrEqual(44);
  });

  it("print body text is at least 10pt", () => {
    expect(bodyPt("print")).toBeGreaterThanOrEqual(10);
  });

  it("every spacing unit sits on the 4px grid", () => {
    for (const p of Object.values(profiles)) expect(px(p["space-unit"]) % 4).toBe(0);
  });

  it("emits only custom properties, so switching surface never touches component CSS", () => {
    const declared = [...css.matchAll(/^\s{2}([\w-]+):/gm)].map((m) => m[1]!);
    expect(declared.length).toBeGreaterThan(0);
    expect(declared.every((n) => n.startsWith("--"))).toBe(true);
  });

  it("scopes each profile with data-surface", () => {
    for (const name of Object.keys(profiles)) expect(css).toContain(`html:root[data-surface="${name}"]`);
  });
});
