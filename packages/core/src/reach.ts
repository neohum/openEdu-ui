export type Side = "left" | "right";
export type HeightPreset = "adult" | "child";
export type Size = { width: number; height: number };

/** Which edge the dock should snap to, given where the teacher is touching. */
export function nearestSide(x: number, viewportWidth: number): Side {
  return x < viewportWidth / 2 ? "left" : "right";
}

/**
 * Dock position kept inside the bottom third of the screen, where both a child
 * and an adult can reach. `child` sits at the very bottom; `adult` at the top
 * of the reachable band.
 */
export function dockPosition(args: {
  viewport: Size;
  dock: Size;
  side: Side;
  preset: HeightPreset;
  margin?: number;
}): { x: number; y: number } {
  const { viewport, dock, side, preset, margin = 16 } = args;
  const bandTop = Math.ceil((viewport.height * 2) / 3);
  const lowest = viewport.height - dock.height - margin;
  const y = preset === "child" ? lowest : Math.min(bandTop, lowest);
  const x = side === "left" ? margin : viewport.width - dock.width - margin;
  return { x, y };
}
