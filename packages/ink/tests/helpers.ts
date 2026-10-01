import { vi } from "vitest";
import type { InkEngine } from "../src/index.ts";

export const pt = (x: number, y: number, pressure = 0.5, t = 0) => ({ x, y, pressure, t });

export function draw(engine: InkEngine, pts: Array<[number, number]>, pressure = 0.5) {
  const [first, ...rest] = pts;
  engine.beginStroke(pt(first![0], first![1], pressure));
  for (const [x, y] of rest) engine.extendStroke(pt(x, y, pressure));
  engine.endStroke();
}

/** Recording 2D context stub (jsdom has no canvas implementation). */
export function makeCtx() {
  const calls: string[] = [];
  const rec = (name: string) =>
    vi.fn(() => {
      calls.push(name);
    });
  const ctx: Record<string, unknown> = { calls, fillStyle: "", globalAlpha: 1 };
  for (const n of ["setTransform", "clearRect", "save", "restore", "beginPath", "moveTo", "quadraticCurveTo", "closePath"]) {
    ctx[n] = rec(n);
  }
  ctx.fill = vi.fn(() => {
    calls.push(`fill:${String(ctx.fillStyle)}:${String(ctx.globalAlpha)}`);
  });
  return ctx as { calls: string[] } & Record<string, unknown>;
}
