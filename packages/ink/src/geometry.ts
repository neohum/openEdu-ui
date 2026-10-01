import type { InkPoint } from "@openedu/core";

type Pt = { x: number; y: number };

function distToSegmentSq(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return (p.x - cx) ** 2 + (p.y - cy) ** 2;
}

function cross(o: Pt, a: Pt, b: Pt): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function segmentsIntersect(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Minimum distance between segments a-b and c-d (0 when they cross). */
export function segmentDistance(a: Pt, b: Pt, c: Pt, d: Pt): number {
  if (segmentsIntersect(a, b, c, d)) return 0;
  return Math.sqrt(
    Math.min(distToSegmentSq(a, c, d), distToSegmentSq(b, c, d), distToSegmentSq(c, a, b), distToSegmentSq(d, a, b)),
  );
}

/**
 * True when the eraser movement `from -> to` passes within `radius` of the
 * polyline `points`. A single-point polyline is treated as a dot.
 */
export function eraserHitsPolyline(from: Pt, to: Pt, points: readonly InkPoint[], radius: number): boolean {
  if (points.length === 0) return false;
  if (points.length === 1) {
    const p = points[0]!;
    return distToSegmentSq(p, from, to) <= radius * radius;
  }
  for (let i = 1; i < points.length; i++) {
    if (segmentDistance(from, to, points[i - 1]!, points[i]!) <= radius) return true;
  }
  return false;
}
