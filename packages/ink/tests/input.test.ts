// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachInkInput, createInkEngine, type InkEngine } from "../src/index.ts";

let host: HTMLElement;
let engine: InkEngine;

function fire(type: string, init: Record<string, unknown> = {}) {
  host.dispatchEvent(
    Object.assign(new Event(type, { cancelable: true }), {
      pointerId: 1,
      pointerType: "pen",
      width: 4,
      height: 4,
      clientX: 0,
      clientY: 0,
      pressure: 0.6,
      button: 0,
      ...init,
    }),
  );
}
const strokes = () => engine.getState().strokes;

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", undefined);
  host = document.createElement("div");
  host.getBoundingClientRect = () => ({ left: 10, top: 20, width: 100, height: 100 }) as DOMRect;
  engine = createInkEngine();
});
afterEach(() => vi.unstubAllGlobals());

describe("attachInkInput", () => {
  it("pen draws with coordinates relative to the host and real pressure", () => {
    attachInkInput(engine, host);
    fire("pointerdown", { clientX: 15, clientY: 30 });
    fire("pointermove", { clientX: 25, clientY: 40, pressure: 0.9 });
    fire("pointerup", { clientX: 25, clientY: 40 });
    expect(strokes()).toHaveLength(1);
    expect(strokes()[0]!.points).toMatchObject([
      { x: 5, y: 10, pressure: 0.6 },
      { x: 15, y: 20, pressure: 0.9 },
    ]);
  });

  it("ignores hover moves without a pen down", () => {
    attachInkInput(engine, host);
    fire("pointermove", { clientX: 25, clientY: 40 });
    expect(strokes()).toHaveLength(0);
    fire("pointerdown");
    fire("pointerup");
    expect(strokes()).toHaveLength(1);
  });

  it("uses coalesced events when the browser provides them", () => {
    attachInkInput(engine, host);
    fire("pointerdown");
    const mk = (x: number) => ({ clientX: x, clientY: 20, pressure: 0.5 });
    fire("pointermove", { getCoalescedEvents: () => [mk(20), mk(30), mk(40)] });
    fire("pointerup");
    expect(strokes()[0]!.points).toHaveLength(4);
  });

  it("mouse draws by default and can be disabled", () => {
    const off = attachInkInput(engine, host);
    fire("pointerdown", { pointerType: "mouse", pressure: 0.5 });
    fire("pointerup", { pointerType: "mouse" });
    expect(strokes()).toHaveLength(1);
    off();
    attachInkInput(engine, host, { mouse: false });
    fire("pointerdown", { pointerType: "mouse" });
    fire("pointerup", { pointerType: "mouse" });
    expect(strokes()).toHaveLength(1);
  });

  it("ignores non-primary mouse buttons", () => {
    attachInkInput(engine, host);
    fire("pointerdown", { pointerType: "mouse", button: 2 });
    fire("pointerup", { pointerType: "mouse" });
    expect(strokes()).toHaveLength(0);
  });

  it("touch is ignored by default and draws with finger: true", () => {
    const off = attachInkInput(engine, host);
    fire("pointerdown", { pointerType: "touch" });
    fire("pointermove", { pointerType: "touch", clientX: 30 });
    fire("pointerup", { pointerType: "touch" });
    expect(strokes()).toHaveLength(0);
    off();

    attachInkInput(engine, host, { finger: true });
    fire("pointerdown", { pointerType: "touch" });
    fire("pointermove", { pointerType: "touch", clientX: 30 });
    fire("pointerup", { pointerType: "touch" });
    expect(strokes()).toHaveLength(1);
  });

  it("rejects palm-sized touch even with finger: true", () => {
    attachInkInput(engine, host, { finger: true });
    fire("pointerdown", { pointerType: "touch", width: 90, height: 90 });
    fire("pointerup", { pointerType: "touch", width: 90, height: 90 });
    expect(strokes()).toHaveLength(0);
  });

  it("rejects a resting hand while the pen is down", () => {
    attachInkInput(engine, host, { finger: true });
    fire("pointerdown", { pointerId: 1 });
    fire("pointerdown", { pointerId: 2, pointerType: "touch" });
    fire("pointermove", { pointerId: 2, pointerType: "touch", clientX: 50 });
    fire("pointerup", { pointerId: 2, pointerType: "touch" });
    fire("pointerup", { pointerId: 1 });
    expect(strokes()).toHaveLength(1);
    expect(strokes()[0]!.points).toHaveLength(1);
  });

  it("ignores a second pointer mid-stroke", () => {
    attachInkInput(engine, host);
    fire("pointerdown", { pointerId: 1, clientX: 10 });
    fire("pointerdown", { pointerId: 2, pointerType: "mouse", clientX: 90 });
    fire("pointermove", { pointerId: 2, pointerType: "mouse", clientX: 95 });
    fire("pointerup", { pointerId: 2, pointerType: "mouse" }); // must not end pen stroke
    expect(strokes()).toHaveLength(0);
    fire("pointermove", { pointerId: 1, clientX: 20 });
    fire("pointerup", { pointerId: 1 });
    expect(strokes()).toHaveLength(1);
    expect(strokes()[0]!.points).toHaveLength(2);
  });

  it("pointercancel ends the stroke, and a finger stroke ends even if the router drops its up", () => {
    attachInkInput(engine, host, { finger: true });
    fire("pointerdown", { pointerType: "touch", pointerId: 5 });
    fire("pointercancel", { pointerType: "touch", pointerId: 5, width: 90, height: 90 });
    expect(strokes()).toHaveLength(1);
  });

  it("captures the pointer when supported", () => {
    const set = vi.fn();
    const release = vi.fn();
    host.setPointerCapture = set;
    host.releasePointerCapture = release;
    attachInkInput(engine, host);
    fire("pointerdown", { pointerId: 7 });
    fire("pointerup", { pointerId: 7 });
    expect(set).toHaveBeenCalledWith(7);
    expect(release).toHaveBeenCalledWith(7);
  });

  it("disposer stops input, commits an open stroke and restores touch-action", () => {
    host.style.touchAction = "pan-y";
    const off = attachInkInput(engine, host);
    expect(host.style.touchAction).toBe("none");
    fire("pointerdown");
    fire("pointermove", { clientX: 40 });
    off();
    expect(strokes()).toHaveLength(1);
    expect(host.style.touchAction).toBe("pan-y");
    fire("pointerdown");
    fire("pointerup");
    expect(strokes()).toHaveLength(1);
  });

  it("drives the eraser tool through the same path", () => {
    attachInkInput(engine, host);
    fire("pointerdown", { clientX: 10, clientY: 30 });
    fire("pointermove", { clientX: 60, clientY: 30 });
    fire("pointerup", { clientX: 60, clientY: 30 });
    engine.setTool("eraser");
    fire("pointerdown", { clientX: 30, clientY: 30 });
    fire("pointerup", { clientX: 30, clientY: 30 });
    expect(strokes()).toHaveLength(0);
  });
});
