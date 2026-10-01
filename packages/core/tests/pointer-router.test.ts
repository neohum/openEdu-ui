import { describe, expect, it, vi } from "vitest";
import { classifyPointer, createPointerRouter } from "../src/pointer-router.ts";

const ptr = (pointerType: string, width = 10, height = 10) => ({ pointerType, width, height });

function fire(target: EventTarget, type: string, init: Record<string, unknown>) {
  target.dispatchEvent(Object.assign(new Event(type), { pointerId: 1, width: 10, height: 10, ...init }));
}

describe("classifyPointer", () => {
  it("routes pen to ink and finger touch to ui", () => {
    expect(classifyPointer(ptr("pen"))).toBe("ink");
    expect(classifyPointer(ptr("touch"))).toBe("ui");
    expect(classifyPointer(ptr("mouse"))).toBe("ui");
    expect(classifyPointer(ptr("mouse"), { mouseInks: true })).toBe("ink");
  });

  it("ignores palm-sized touch contacts", () => {
    expect(classifyPointer(ptr("touch", 80, 60))).toBe("ignore");
    expect(classifyPointer(ptr("touch", 40, 40))).toBe("ui");
    expect(classifyPointer(ptr("touch", 41, 10))).toBe("ignore");
    expect(classifyPointer(ptr("touch", 30, 30), { palmThreshold: 20 })).toBe("ignore");
  });

  it("routes finger touch to ink only when touchInks is set, still rejecting palms", () => {
    expect(classifyPointer(ptr("touch"), { touchInks: true })).toBe("ink");
    expect(classifyPointer(ptr("touch", 80, 60), { touchInks: true })).toBe("ignore");
    expect(classifyPointer(ptr("touch"), { touchInks: true, penActive: true })).toBe("ignore");
    expect(classifyPointer(ptr("touch"), { touchInks: false })).toBe("ui");
  });

  it("ignores touch while a pen is down", () => {
    expect(classifyPointer(ptr("touch"), { penActive: true })).toBe("ignore");
  });
});

describe("createPointerRouter", () => {
  it("dispatches ink and ui events and drops palm contacts", () => {
    const target = new EventTarget();
    const onInk = vi.fn();
    const onUi = vi.fn();
    createPointerRouter(target, { onInk, onUi });

    fire(target, "pointerdown", { pointerType: "pen" });
    fire(target, "pointerup", { pointerType: "pen" });
    fire(target, "pointerdown", { pointerType: "touch" });
    fire(target, "pointerdown", { pointerType: "touch", width: 90, height: 90 });

    expect(onInk).toHaveBeenCalledTimes(2);
    expect(onInk.mock.calls[0]![0]).toMatchObject({ route: "ink", type: "down" });
    expect(onUi).toHaveBeenCalledTimes(1);
  });

  it("rejects a resting hand while the pen writes, then accepts touch again", () => {
    const target = new EventTarget();
    const onUi = vi.fn();
    createPointerRouter(target, { onUi });

    fire(target, "pointerdown", { pointerType: "pen", pointerId: 1 });
    fire(target, "pointerdown", { pointerType: "touch", pointerId: 2 });
    expect(onUi).not.toHaveBeenCalled();

    fire(target, "pointerup", { pointerType: "pen", pointerId: 1 });
    fire(target, "pointerdown", { pointerType: "touch", pointerId: 3 });
    expect(onUi).toHaveBeenCalledTimes(1);
  });

  it("sends touch to onInk with touchInks", () => {
    const target = new EventTarget();
    const onInk = vi.fn();
    const onUi = vi.fn();
    createPointerRouter(target, { onInk, onUi }, { touchInks: true });
    fire(target, "pointerdown", { pointerType: "touch" });
    expect(onInk).toHaveBeenCalledTimes(1);
    expect(onUi).not.toHaveBeenCalled();
  });

  it("stops routing after dispose", () => {
    const target = new EventTarget();
    const onUi = vi.fn();
    const dispose = createPointerRouter(target, { onUi });
    dispose();
    fire(target, "pointerdown", { pointerType: "touch" });
    expect(onUi).not.toHaveBeenCalled();
  });
});
