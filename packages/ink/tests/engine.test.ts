import { describe, expect, it, vi } from "vitest";
import { createInkEngine, type InkState } from "../src/index.ts";
import { draw, pt } from "./helpers.ts";

const line = (y: number): Array<[number, number]> => [
  [0, y],
  [50, y],
  [100, y],
];

describe("strokes", () => {
  it("creates a stroke from begin/extend/end with current tool metadata", () => {
    const e = createInkEngine({ color: "#ff0000", size: 6 });
    draw(e, line(10));
    const s = e.getState().strokes;
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ tool: "pen", color: "#ff0000", size: 6 });
    expect(s[0]!.points).toHaveLength(3);
    expect(typeof s[0]!.id).toBe("string");
  });

  it("does not commit before endStroke and ignores extend without begin", () => {
    const e = createInkEngine();
    e.extendStroke(pt(1, 1));
    e.endStroke();
    expect(e.getState().strokes).toHaveLength(0);
    e.beginStroke(pt(0, 0));
    e.extendStroke(pt(5, 5));
    expect(e.getState().strokes).toHaveLength(0);
    expect(e.canUndo()).toBe(false);
  });

  it("keeps real pressure and substitutes 0.5 for missing/zero pressure", () => {
    const e = createInkEngine();
    e.beginStroke({ x: 0, y: 0, pressure: 0, t: 0 });
    e.extendStroke({ x: 1, y: 1, pressure: 0.8, t: 1 });
    e.extendStroke({ x: 2, y: 2, pressure: undefined as unknown as number, t: 2 });
    e.endStroke();
    expect(e.getState().strokes[0]!.points.map((p) => p.pressure)).toEqual([0.5, 0.8, 0.5]);
  });

  it("stores highlighter base color (not rgba) and tool", () => {
    const e = createInkEngine({ color: "#ffee00" });
    e.setTool("highlighter");
    draw(e, line(5));
    expect(e.getState().strokes[0]).toMatchObject({ tool: "highlighter", color: "#ffee00" });
  });

  it("setColor/setSize apply to later strokes only", () => {
    const e = createInkEngine();
    draw(e, line(1));
    e.setColor("#00f");
    e.setSize(9);
    draw(e, line(2));
    const [a, b] = e.getState().strokes;
    expect([a!.color, a!.size]).toEqual(["#0f172a", 4]);
    expect([b!.color, b!.size]).toEqual(["#00f", 9]);
    expect(e.color).toBe("#00f");
    expect(e.size).toBe(9);
  });

  it("getState returns a deep clone", () => {
    const e = createInkEngine();
    draw(e, line(1));
    const s = e.getState();
    s.strokes[0]!.points[0]!.x = 999;
    s.strokes.pop();
    expect(e.getState().strokes).toHaveLength(1);
    expect(e.getState().strokes[0]!.points[0]!.x).toBe(0);
  });
});

describe("eraser", () => {
  const setup = () => {
    const e = createInkEngine({ eraserSize: 10 });
    draw(e, line(0));
    draw(e, line(100));
    draw(e, line(200));
    e.setTool("eraser");
    return e;
  };

  it("removes only intersected strokes as one undo step", () => {
    const e = setup();
    const ids = e.getState().strokes.map((s) => s.id);
    e.beginStroke(pt(50, -5)); // hits stroke at y=0
    e.extendStroke(pt(50, 105)); // sweeps through y=100
    e.endStroke();
    expect(e.getState().strokes.map((s) => s.id)).toEqual([ids[2]]);
    e.undo(); // erase undone in one step
    expect(e.getState().strokes.map((s) => s.id)).toEqual(ids);
    e.redo();
    expect(e.getState().strokes.map((s) => s.id)).toEqual([ids[2]]);
  });

  it("does not remove strokes outside eraserSize", () => {
    const e = setup();
    e.beginStroke(pt(50, 50));
    e.extendStroke(pt(60, 50));
    e.endStroke();
    expect(e.getState().strokes).toHaveLength(3);
  });

  it("erasing nothing creates no history entry or notification", () => {
    const e = setup();
    const onChange = vi.fn();
    e.subscribe(onChange);
    e.beginStroke(pt(500, 500));
    e.extendStroke(pt(510, 510));
    e.endStroke();
    expect(onChange).not.toHaveBeenCalled();
    e.undo(); // undoes the last drawn stroke, proving no eraser op sits on top
    expect(e.getState().strokes).toHaveLength(2);
  });

  it("restores original order on undo", () => {
    const e = setup();
    const ids = e.getState().strokes.map((s) => s.id);
    e.beginStroke(pt(50, 100));
    e.endStroke();
    expect(e.getState().strokes).toHaveLength(2);
    e.undo();
    expect(e.getState().strokes.map((s) => s.id)).toEqual(ids);
  });

  it("erases a single-dot stroke", () => {
    const e = createInkEngine({ eraserSize: 8 });
    e.beginStroke(pt(20, 20));
    e.endStroke();
    e.setTool("eraser");
    e.beginStroke(pt(24, 20));
    e.endStroke();
    expect(e.getState().strokes).toHaveLength(0);
  });
});

describe("history", () => {
  it("undo/redo and availability", () => {
    const e = createInkEngine();
    expect([e.canUndo(), e.canRedo()]).toEqual([false, false]);
    draw(e, line(1));
    draw(e, line(2));
    expect([e.canUndo(), e.canRedo()]).toEqual([true, false]);
    e.undo();
    expect(e.getState().strokes).toHaveLength(1);
    expect([e.canUndo(), e.canRedo()]).toEqual([true, true]);
    e.redo();
    expect(e.getState().strokes).toHaveLength(2);
    e.undo();
    e.undo();
    expect(e.canUndo()).toBe(false);
    e.undo(); // no-op
    expect(e.getState().strokes).toHaveLength(0);
  });

  it("a new operation after undo clears redo", () => {
    const e = createInkEngine();
    draw(e, line(1));
    e.undo();
    expect(e.canRedo()).toBe(true);
    draw(e, line(2));
    expect(e.canRedo()).toBe(false);
  });

  it("clear is undoable and a no-op when empty", () => {
    const e = createInkEngine();
    e.clear();
    expect(e.canUndo()).toBe(false);
    draw(e, line(1));
    draw(e, line(2));
    e.clear();
    expect(e.getState().strokes).toHaveLength(0);
    e.undo();
    expect(e.getState().strokes).toHaveLength(2);
    e.redo();
    expect(e.getState().strokes).toHaveLength(0);
  });

  it("starting undo mid-stroke commits the stroke first", () => {
    const e = createInkEngine();
    draw(e, line(1));
    e.beginStroke(pt(0, 0));
    e.undo();
    expect(e.getState().strokes).toHaveLength(1);
    expect(e.canRedo()).toBe(true);
  });
});

describe("load", () => {
  const valid = (): InkState => ({
    version: 1,
    strokes: [{ id: "a", tool: "pen", color: "#000", size: 3, points: [pt(1, 2, 0.4, 5)] }],
  });

  it("replaces content, clears history, and deep-clones the input", () => {
    const e = createInkEngine();
    draw(e, line(1));
    e.undo();
    const input = valid();
    e.load(input);
    expect(e.getState()).toEqual(valid());
    expect([e.canUndo(), e.canRedo()]).toEqual([false, false]);
    input.strokes[0]!.points[0]!.x = 77;
    expect(e.getState().strokes[0]!.points[0]!.x).toBe(1);
  });

  const bad: Array<[string, unknown]> = [
    ["null", null],
    ["array", []],
    ["wrong version", { version: 2, strokes: [] }],
    ["missing strokes", { version: 1 }],
    ["strokes not array", { version: 1, strokes: {} }],
    ["stroke not object", { version: 1, strokes: [1] }],
    ["bad tool", { version: 1, strokes: [{ ...valid().strokes[0], tool: "eraser" }] }],
    ["empty id", { version: 1, strokes: [{ ...valid().strokes[0], id: "" }] }],
    ["non-string color", { version: 1, strokes: [{ ...valid().strokes[0], color: 1 }] }],
    ["NaN size", { version: 1, strokes: [{ ...valid().strokes[0], size: NaN }] }],
    ["zero size", { version: 1, strokes: [{ ...valid().strokes[0], size: 0 }] }],
    ["points not array", { version: 1, strokes: [{ ...valid().strokes[0], points: null }] }],
    ["Infinity point", { version: 1, strokes: [{ ...valid().strokes[0], points: [pt(Infinity, 0)] }] }],
    ["string coord", { version: 1, strokes: [{ ...valid().strokes[0], points: [{ x: "1", y: 0, pressure: 1, t: 0 }] }] }],
    ["missing t", { version: 1, strokes: [{ ...valid().strokes[0], points: [{ x: 1, y: 0, pressure: 1 }] }] }],
    ["duplicate ids", { version: 1, strokes: [valid().strokes[0], valid().strokes[0]] }],
  ];
  it.each(bad)("throws on invalid input: %s", (_name, input) => {
    const e = createInkEngine();
    draw(e, line(1));
    expect(() => e.load(input as InkState)).toThrow(/Invalid ink state/);
    expect(e.getState().strokes).toHaveLength(1); // untouched on failure
  });
});

describe("subscribe / onChange", () => {
  it("notifies on commits, history changes and tool changes; unsubscribes", () => {
    const e = createInkEngine();
    const l = vi.fn();
    const off = e.subscribe(l);
    draw(e, line(1));
    expect(l).toHaveBeenCalledTimes(1);
    e.undo();
    e.redo();
    e.clear();
    expect(l).toHaveBeenCalledTimes(4);
    e.setTool("highlighter");
    expect(l).toHaveBeenCalledTimes(5);
    off();
    draw(e, line(2));
    expect(l).toHaveBeenCalledTimes(5);
  });

  it("calls onChange with a state snapshot after each committed change only", () => {
    const onChange = vi.fn();
    const e = createInkEngine({ onChange });
    e.beginStroke(pt(0, 0));
    e.extendStroke(pt(1, 1));
    expect(onChange).not.toHaveBeenCalled();
    e.endStroke();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall![0].strokes).toHaveLength(1);
    e.setColor("#123"); // not a content change
    expect(onChange).toHaveBeenCalledTimes(1);
    e.undo();
    e.redo();
    e.clear();
    e.load({ version: 1, strokes: [] });
    expect(onChange).toHaveBeenCalledTimes(5);
  });
});
