import { describe, expect, it } from "vitest";
import { dockPosition, nearestSide } from "../src/reach.ts";

const viewport = { width: 1920, height: 1080 };
const dock = { width: 480, height: 96 };

describe("nearestSide", () => {
  it("snaps to the side closer to the touch", () => {
    expect(nearestSide(100, 1920)).toBe("left");
    expect(nearestSide(1500, 1920)).toBe("right");
  });
});

describe("dockPosition", () => {
  it.each([
    ["left", "adult"],
    ["left", "child"],
    ["right", "adult"],
    ["right", "child"],
  ] as const)("keeps the %s/%s dock inside the bottom third", (side, preset) => {
    const { x, y } = dockPosition({ viewport, dock, side, preset });
    expect(y).toBeGreaterThanOrEqual(viewport.height * (2 / 3));
    expect(y + dock.height).toBeLessThanOrEqual(viewport.height);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x + dock.width).toBeLessThanOrEqual(viewport.width);
  });

  it("places the child preset lower than adult, and sides on opposite edges", () => {
    const adult = dockPosition({ viewport, dock, side: "left", preset: "adult" });
    const child = dockPosition({ viewport, dock, side: "left", preset: "child" });
    expect(child.y).toBeGreaterThan(adult.y);
    expect(dockPosition({ viewport, dock, side: "right", preset: "adult" }).x).toBe(1920 - 480 - 16);
  });

  it("follows orientation change", () => {
    const portrait = { width: 1080, height: 1920 };
    const { y } = dockPosition({ viewport: portrait, dock, side: "right", preset: "adult" });
    expect(y).toBeGreaterThanOrEqual(1280);
  });
});
