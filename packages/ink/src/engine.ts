import type { InkPoint, InkTool } from "@openedu/core";
import { eraserHitsPolyline } from "./geometry.ts";
import { DEFAULT_PRESSURE, drawAll } from "./render.ts";
import type { InkEngine, InkOptions, InkState, Stroke } from "./types.ts";
import { parseInkState } from "./validate.ts";

type Removed = { index: number; stroke: Stroke };
type Op =
  | { kind: "add-stroke"; stroke: Stroke }
  | { kind: "erase-strokes"; removed: Removed[] }
  | { kind: "clear"; strokes: Stroke[] };

const cloneStroke = (s: Stroke): Stroke => ({ ...s, points: s.points.map((p) => ({ ...p })) });

function normalize(p: InkPoint): InkPoint {
  const pressure = Number.isFinite(p.pressure) && p.pressure > 0 ? Math.min(1, p.pressure) : DEFAULT_PRESSURE;
  return { x: p.x, y: p.y, pressure, t: Number.isFinite(p.t) ? p.t : 0 };
}

let idCounter = 0;
const newId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `s${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function createInkEngine(options: InkOptions = {}): InkEngine {
  // The engine is token-agnostic, so the fallback ink color must be a concrete value.
  let color = options.color ?? "#0f172a"; // lint-ignore
  let size = options.size ?? 4;
  const eraserSize = options.eraserSize ?? 16;
  const pixelRatio = options.pixelRatio ?? (typeof window !== "undefined" ? window.devicePixelRatio : 1) ?? 1;
  let tool: InkTool = "pen";

  let strokes: Stroke[] = [];
  let undoStack: Op[] = [];
  let redoStack: Op[] = [];
  // In-progress gesture: a stroke being drawn, or an eraser sweep.
  let active: Stroke | null = null;
  let eraser: { last: InkPoint; removed: Removed[] } | null = null;

  const listeners = new Set<() => void>();
  let host: HTMLElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let observer: ResizeObserver | null = null;
  let restoreHostPosition: (() => void) | null = null;
  let width = 0;
  let height = 0;
  let frame: number | null = null;

  const emit = () => [...listeners].forEach((l) => l());
  const snapshot = (): InkState => ({ version: 1, strokes: strokes.map(cloneStroke) });
  const committed = () => {
    scheduleDraw();
    emit();
    options.onChange?.(snapshot());
  };

  function paint() {
    frame = null;
    if (!ctx || !canvas) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawAll(ctx, strokes, active);
  }
  function scheduleDraw() {
    if (!ctx) return;
    if (typeof requestAnimationFrame !== "function") return paint();
    if (frame === null) frame = requestAnimationFrame(paint);
  }
  function resize() {
    if (!host || !canvas) return;
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    paint(); // resizing clears the bitmap, so redraw synchronously to avoid a blank flash
  }

  function apply(op: Op, dir: "do" | "undo") {
    if (op.kind === "add-stroke") {
      if (dir === "do") strokes.push(cloneStroke(op.stroke));
      else strokes = strokes.filter((s) => s.id !== op.stroke.id);
    } else if (op.kind === "clear") {
      strokes = dir === "do" ? [] : op.strokes.map(cloneStroke);
    } else if (dir === "do") {
      for (const r of op.removed) strokes.splice(r.index, 1);
    } else {
      for (let i = op.removed.length - 1; i >= 0; i--) {
        const r = op.removed[i]!;
        strokes.splice(r.index, 0, cloneStroke(r.stroke));
      }
    }
  }

  function push(op: Op) {
    undoStack.push(op);
    redoStack = [];
  }

  function sweep(from: InkPoint, to: InkPoint) {
    if (!eraser) return;
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i]!;
      if (eraserHitsPolyline(from, to, s.points, eraserSize)) {
        eraser.removed.push({ index: i, stroke: s });
        strokes.splice(i, 1);
      }
    }
  }

  const engine: InkEngine = {
    get tool() {
      return tool;
    },
    get color() {
      return color;
    },
    get size() {
      return size;
    },
    setTool(next) {
      if (next === tool) return;
      engine.endStroke();
      tool = next;
      emit();
    },
    setColor(next) {
      if (next === color) return;
      color = next;
      emit();
    },
    setSize(next) {
      if (!Number.isFinite(next) || next <= 0 || next === size) return;
      size = next;
      emit();
    },

    attach(el) {
      if (host) engine.detach();
      host = el;
      if (typeof getComputedStyle === "function" && getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restoreHostPosition = () => {
          el.style.position = "";
        };
      }
      const c = el.ownerDocument.createElement("canvas");
      Object.assign(c.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        touchAction: "none",
        pointerEvents: "none",
      });
      el.appendChild(c);
      canvas = c;
      ctx = c.getContext("2d");
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver(() => resize());
        observer.observe(el);
      }
      resize();
    },
    detach() {
      observer?.disconnect();
      observer = null;
      if (frame !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      frame = null;
      canvas?.remove();
      canvas = null;
      ctx = null;
      restoreHostPosition?.();
      restoreHostPosition = null;
      host = null;
    },

    beginStroke(point) {
      if (active || eraser) engine.endStroke();
      const p = normalize(point);
      if (tool === "eraser") {
        eraser = { last: p, removed: [] };
        sweep(p, p);
        scheduleDraw();
        return;
      }
      active = { id: newId(), tool, color, size, points: [p] };
      scheduleDraw();
    },
    extendStroke(point) {
      const p = normalize(point);
      if (eraser) {
        sweep(eraser.last, p);
        eraser.last = p;
      } else if (active) {
        active.points.push(p);
      } else return;
      scheduleDraw();
    },
    endStroke() {
      if (eraser) {
        const { removed } = eraser;
        eraser = null;
        if (removed.length === 0) return;
        push({ kind: "erase-strokes", removed });
        committed();
      } else if (active) {
        const stroke = active;
        active = null;
        push({ kind: "add-stroke", stroke });
        strokes.push(stroke);
        committed();
      }
    },

    clear() {
      engine.endStroke();
      if (strokes.length === 0) return;
      push({ kind: "clear", strokes });
      strokes = [];
      committed();
    },

    undo() {
      engine.endStroke();
      const op = undoStack.pop();
      if (!op) return;
      apply(op, "undo");
      redoStack.push(op);
      committed();
    },
    redo() {
      engine.endStroke();
      const op = redoStack.pop();
      if (!op) return;
      apply(op, "do");
      undoStack.push(op);
      committed();
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,

    getState: snapshot,
    load(state) {
      const parsed = parseInkState(state);
      active = null;
      eraser = null;
      strokes = parsed.strokes;
      undoStack = [];
      redoStack = [];
      committed();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },

    toBlob(type = "image/png") {
      engine.endStroke();
      const doc = host?.ownerDocument ?? (typeof document !== "undefined" ? document : null);
      if (!doc) return Promise.reject(new Error("toBlob requires a DOM"));
      let w = width;
      let h = height;
      if (!host) {
        // Detached: size to the strokes' extent so nothing is cropped.
        for (const s of strokes) for (const p of s.points) {
          w = Math.max(w, p.x + s.size * 3);
          h = Math.max(h, p.y + s.size * 3);
        }
      }
      const out = doc.createElement("canvas");
      out.width = Math.max(1, Math.round(w * pixelRatio));
      out.height = Math.max(1, Math.round(h * pixelRatio));
      const g = out.getContext("2d");
      if (!g) return Promise.reject(new Error("2D canvas context is unavailable"));
      g.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawAll(g, strokes);
      return new Promise<Blob>((resolve, reject) => {
        out.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas produced no image"))), type);
      });
    },
  };
  return engine;
}
