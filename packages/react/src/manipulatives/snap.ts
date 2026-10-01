export type GridSpec = { min: number; max: number; step: number };

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Snaps a 0..1 position along a track to the nearest grid value. */
export function snapValue(fraction: number, { min, max, step }: GridSpec): number {
  const raw = min + clamp(fraction, 0, 1) * (max - min);
  return clamp(min + Math.round((raw - min) / step) * step, min, max);
}

export const fractionOf = (value: number, { min, max }: GridSpec) => (max === min ? 0 : (clamp(value, min, max) - min) / (max - min));
