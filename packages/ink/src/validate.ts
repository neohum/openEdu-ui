import type { InkPoint } from "@openedu/core";
import type { InkState, Stroke } from "./types.ts";

const fail = (msg: string): never => {
  throw new Error(`Invalid ink state: ${msg}`);
};
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Validates untrusted input and returns a deep copy. Throws a descriptive Error. */
export function parseInkState(input: unknown): InkState {
  if (!isObj(input)) return fail("expected an object");
  if (input.version !== 1) return fail(`unsupported version ${String(input.version)}`);
  if (!Array.isArray(input.strokes)) return fail("strokes must be an array");
  const seen = new Set<string>();
  const strokes = input.strokes.map((s: unknown, i): Stroke => {
    if (!isObj(s)) return fail(`strokes[${i}] must be an object`);
    if (typeof s.id !== "string" || s.id === "") return fail(`strokes[${i}].id must be a non-empty string`);
    if (seen.has(s.id)) return fail(`strokes[${i}].id "${s.id}" is duplicated`);
    seen.add(s.id);
    if (s.tool !== "pen" && s.tool !== "highlighter") return fail(`strokes[${i}].tool must be "pen" or "highlighter"`);
    if (typeof s.color !== "string" || s.color === "") return fail(`strokes[${i}].color must be a non-empty string`);
    if (!finite(s.size) || s.size <= 0) return fail(`strokes[${i}].size must be a positive finite number`);
    if (!Array.isArray(s.points)) return fail(`strokes[${i}].points must be an array`);
    const points = s.points.map((p: unknown, j): InkPoint => {
      if (!isObj(p)) return fail(`strokes[${i}].points[${j}] must be an object`);
      const { x, y, pressure, t } = p;
      if (!finite(x) || !finite(y) || !finite(pressure) || !finite(t)) {
        return fail(`strokes[${i}].points[${j}] needs finite x, y, pressure and t`);
      }
      return { x, y, pressure, t };
    });
    return { id: s.id, tool: s.tool, color: s.color, size: s.size, points };
  });
  return { version: 1, strokes };
}
