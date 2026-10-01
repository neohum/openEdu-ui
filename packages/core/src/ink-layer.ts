/**
 * Contract between the design system and a drawing engine (tldraw, Konva, …).
 * Engines are optional adapters; the core package never depends on one.
 */
export type InkPoint = { x: number; y: number; pressure: number; t: number };

export type InkTool = "pen" | "highlighter" | "eraser";

export interface InkLayer {
  readonly tool: InkTool;
  setTool(tool: InkTool): void;
  attach(host: HTMLElement): void;
  detach(): void;
  beginStroke(point: InkPoint): void;
  extendStroke(point: InkPoint): void;
  endStroke(): void;
  clear(): void;
}
