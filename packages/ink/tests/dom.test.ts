// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInkEngine } from "../src/index.ts";
import { draw, makeCtx } from "./helpers.ts";

let ctx: ReturnType<typeof makeCtx>;
let toBlob: ReturnType<typeof vi.fn>;

function mockHost(w = 300, h = 200) {
  const host = document.createElement("div");
  host.getBoundingClientRect = () => ({ width: w, height: h, left: 0, top: 0, right: w, bottom: h, x: 0, y: 0, toJSON() {} });
  document.body.appendChild(host);
  return host;
}

beforeEach(() => {
  ctx = makeCtx();
  toBlob = vi.fn((cb: (b: Blob | null) => void, type?: string) => cb(new Blob(["x"], { type })));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ctx) as never);
  HTMLCanvasElement.prototype.toBlob = toBlob as never;
  vi.stubGlobal("requestAnimationFrame", undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("attach / detach", () => {
  it("appends a non-interactive canvas sized by pixelRatio and removes it on detach", () => {
    const host = mockHost(300, 200);
    const e = createInkEngine({ pixelRatio: 2 });
    e.attach(host);
    const canvas = host.querySelector("canvas")!;
    expect(canvas).toBeTruthy();
    expect([canvas.width, canvas.height]).toEqual([600, 400]);
    expect(canvas.style.pointerEvents).toBe("none");
    expect(canvas.style.touchAction).toBe("none");
    expect(canvas.style.position).toBe("absolute");
    expect(host.style.position).toBe("relative"); // static host gets positioned
    e.detach();
    expect(host.querySelector("canvas")).toBeNull();
    expect(host.style.position).toBe("");
  });

  it("re-attaching moves the canvas instead of duplicating it", () => {
    const a = mockHost();
    const b = mockHost();
    const e = createInkEngine();
    e.attach(a);
    e.attach(b);
    expect(a.querySelector("canvas")).toBeNull();
    expect(b.querySelectorAll("canvas")).toHaveLength(1);
  });

  it("observes resize, redraws and disconnects on detach", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let trigger = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          trigger = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const host = mockHost(100, 50);
    const e = createInkEngine({ pixelRatio: 1 });
    e.attach(host);
    expect(observe).toHaveBeenCalledWith(host);
    draw(e, [[1, 1], [20, 20]]);
    host.getBoundingClientRect = () => ({ width: 400, height: 300 }) as DOMRect;
    ctx.calls.length = 0;
    trigger();
    const canvas = host.querySelector("canvas")!;
    expect([canvas.width, canvas.height]).toEqual([400, 300]);
    expect(ctx.calls.some((c) => c.startsWith("fill:"))).toBe(true);
    e.detach();
    expect(disconnect).toHaveBeenCalled();
  });

  it("draws committed strokes: pen opaque, highlighter ~35% alpha with the base color", () => {
    const e = createInkEngine({ pixelRatio: 1, color: "#ff0000" });
    e.attach(mockHost());
    draw(e, [[0, 10], [40, 10], [80, 12]]);
    e.setTool("highlighter");
    draw(e, [[0, 50], [40, 50], [80, 52]]);
    const fills = ctx.calls.filter((c) => c.startsWith("fill:"));
    expect(fills).toContain("fill:#ff0000:1");
    expect(fills).toContain("fill:#ff0000:0.35");
  });

  it("batches drawing with requestAnimationFrame when available", () => {
    const cbs: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => cbs.push(cb));
    const e = createInkEngine({ pixelRatio: 1 });
    e.attach(mockHost());
    ctx.calls.length = 0;
    e.beginStroke({ x: 0, y: 0, pressure: 0.5, t: 0 });
    e.extendStroke({ x: 5, y: 5, pressure: 0.5, t: 1 });
    e.extendStroke({ x: 9, y: 9, pressure: 0.5, t: 2 });
    expect(cbs).toHaveLength(1);
    expect(ctx.calls.filter((c) => c.startsWith("fill:"))).toHaveLength(0);
    cbs[0]!(0);
    expect(ctx.calls.filter((c) => c.startsWith("fill:"))).toHaveLength(1); // in-progress stroke
  });

  it("works without a 2D context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => null) as never);
    const e = createInkEngine();
    e.attach(mockHost());
    expect(() => draw(e, [[0, 0], [5, 5]])).not.toThrow();
  });
});

describe("toBlob", () => {
  it("renders strokes on a fresh canvas and resolves a Blob", async () => {
    const host = mockHost(300, 200);
    const e = createInkEngine({ pixelRatio: 2 });
    e.attach(host);
    draw(e, [[0, 10], [40, 10], [80, 12]]);
    const blob = await e.toBlob();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), "image/png");
  });

  it("works detached and rejects when the canvas yields no image", async () => {
    const e = createInkEngine({ pixelRatio: 1 });
    draw(e, [[0, 10], [40, 10]]);
    await expect(e.toBlob()).resolves.toBeInstanceOf(Blob);
    toBlob.mockImplementationOnce((cb: (b: Blob | null) => void) => cb(null));
    await expect(e.toBlob()).rejects.toThrow(/no image/);
  });
});
