import type { InkLayer, InkPoint } from "@openedu/core";

export type StrokeTool = "pen" | "highlighter";
export type Stroke = { id: string; tool: StrokeTool; color: string; size: number; points: InkPoint[] };
export type InkState = { version: 1; strokes: Stroke[] };

export type InkOptions = {
  /** Concrete CSS color string (default: near-black slate). */
  color?: string;
  /** Pen width in CSS px (default 4). */
  size?: number;
  /** Eraser radius in CSS px (default 16). */
  eraserSize?: number;
  /** Canvas backing-store scale (default window.devicePixelRatio ?? 1). */
  pixelRatio?: number;
  /** Called after every committed change (stroke end, erase, undo, redo, clear, load). */
  onChange?: (state: InkState) => void;
};

export interface InkEngine extends InkLayer {
  setColor(color: string): void;
  setSize(size: number): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  /** Deep-cloned snapshot. */
  getState(): InkState;
  /** Replaces content and clears history. Throws on invalid input. */
  load(state: InkState): void;
  /** Fires on any change, including history availability. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /** Renders the strokes on a transparent canvas at the current size. */
  toBlob(type?: "image/png"): Promise<Blob>;
  readonly color: string;
  readonly size: number;
}
