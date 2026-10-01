import { getStroke } from "perfect-freehand";
import type { Stroke } from "./types.ts";

/** Highlighter is drawn this many times wider than the pen size. */
export const HIGHLIGHTER_SCALE = 3;
export const HIGHLIGHTER_ALPHA = 0.35;

/** Pressure stored for inputs that report none (mouse); such strokes use simulated pressure. */
export const DEFAULT_PRESSURE = 0.5;

export function strokeOutline(stroke: Stroke): number[][] {
  const hl = stroke.tool === "highlighter";
  const simulatePressure = stroke.points.every((p) => p.pressure === DEFAULT_PRESSURE);
  return getStroke(
    stroke.points.map((p) => [p.x, p.y, p.pressure]),
    {
      size: hl ? stroke.size * HIGHLIGHTER_SCALE : stroke.size,
      thinning: hl ? 0 : 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: hl ? false : simulatePressure,
      last: true,
      ...(hl ? { start: { cap: false }, end: { cap: false } } : {}),
    },
  );
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length === 0) return;
  const outline = strokeOutline(stroke);
  if (outline.length === 0) return;
  ctx.save();
  ctx.fillStyle = stroke.color;
  ctx.globalAlpha = stroke.tool === "highlighter" ? HIGHLIGHTER_ALPHA : 1;
  ctx.beginPath();
  const first = outline[0]!;
  ctx.moveTo(first[0]!, first[1]!);
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i]!;
    const b = outline[(i + 1) % outline.length]!;
    ctx.quadraticCurveTo(a[0]!, a[1]!, (a[0]! + b[0]!) / 2, (a[1]! + b[1]!) / 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawAll(ctx: CanvasRenderingContext2D, strokes: readonly Stroke[], extra?: Stroke | null): void {
  for (const s of strokes) drawStroke(ctx, s);
  if (extra) drawStroke(ctx, extra);
}
