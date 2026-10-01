import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { AdaptiveDock, FocusCurtain, RadialMenu, SplitBoard, openRatioFromPointer, radialPositions } from "../src/index.ts";

const viewport = { width: 1920, height: 1080 };
const dockSize = { width: 480, height: 96 };
const cssVar = (el: HTMLElement, name: string) => parseFloat(el.style.getPropertyValue(name));

describe("AdaptiveDock", () => {
  it.each(["adult", "child"] as const)("keeps the %s preset inside the bottom third", (preset) => {
    render(<AdaptiveDock label="도구" preset={preset} viewport={viewport} dockSize={dockSize}>x</AdaptiveDock>);
    const dock = screen.getByRole("toolbar", { name: "도구" });
    const y = cssVar(dock, "--oe-dock-y");
    expect(y).toBeGreaterThanOrEqual((viewport.height * 2) / 3);
    expect(y + dockSize.height).toBeLessThanOrEqual(viewport.height);
  });

  it("switches height preset from the toggle button", async () => {
    render(<AdaptiveDock label="도구" viewport={viewport} dockSize={dockSize}>x</AdaptiveDock>);
    const dock = screen.getByRole("toolbar");
    const adultY = cssVar(dock, "--oe-dock-y");
    await userEvent.click(screen.getByRole("button", { name: "학생 높이" }));
    expect(dock).toHaveAttribute("data-preset", "child");
    expect(cssVar(dock, "--oe-dock-y")).toBeGreaterThan(adultY);
  });

  it("snaps to the side nearest to where the handle is released, and by keyboard", async () => {
    const onSideChange = vi.fn();
    render(<AdaptiveDock label="도구" viewport={viewport} dockSize={dockSize} onSideChange={onSideChange}>x</AdaptiveDock>);
    const handle = screen.getByRole("button", { name: "독 위치 이동" });
    fireEvent.pointerUp(handle, { clientX: 1500 });
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-side", "right");
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-side", "left");
    expect(onSideChange).toHaveBeenLastCalledWith("left");
  });
});

describe("FocusCurtain", () => {
  it("maps pointer position to an open ratio for every edge", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 };
    expect(openRatioFromPointer("top", { x: 0, y: 25 }, rect)).toBeCloseTo(0.75);
    expect(openRatioFromPointer("bottom", { x: 0, y: 25 }, rect)).toBeCloseTo(0.25);
    expect(openRatioFromPointer("left", { x: 50, y: 0 }, rect)).toBeCloseTo(0.75);
    expect(openRatioFromPointer("right", { x: 50, y: 0 }, rect)).toBeCloseTo(0.25);
    expect(openRatioFromPointer("top", { x: 0, y: 900 }, rect)).toBe(0);
  });

  it("changes the open ratio by dragging the handle", () => {
    const onValueChange = vi.fn();
    const { container } = render(<FocusCurtain label="가림막" onValueChange={onValueChange}>정답</FocusCurtain>);
    const host = container.firstElementChild as HTMLElement;
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 200 }) as DOMRect;
    const handle = screen.getByRole("slider", { name: "가림막" });
    fireEvent.pointerDown(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 10, clientY: 50 });
    expect(onValueChange).toHaveBeenLastCalledWith(0.75);
    expect(handle).toHaveAttribute("aria-valuenow", "75");
    fireEvent.pointerUp(handle);
    fireEvent.pointerMove(handle, { clientX: 10, clientY: 150 });
    expect(handle).toHaveAttribute("aria-valuenow", "75");
  });

  it("is operable with arrow keys, Home and End", async () => {
    render(<FocusCurtain label="가림막" defaultValue={0.5}>정답</FocusCurtain>);
    const handle = screen.getByRole("slider");
    handle.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(handle).toHaveAttribute("aria-valuenow", "60");
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(handle).toHaveAttribute("aria-valuenow", "40");
    await userEvent.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("RadialMenu", () => {
  const items = [
    { id: "pen", label: "펜", icon: "pencil-simple" },
    { id: "erase", label: "지우개", icon: "eraser" },
    { id: "undo", label: "되돌리기", icon: "arrow-u-up-left" },
  ];

  it("keeps every item inside the viewport even when opened in a corner", () => {
    const positions = radialPositions(8, 128, { x: 4, y: 4 }, { width: 800, height: 600 }, 40);
    for (const p of positions) {
      expect(p.x).toBeGreaterThanOrEqual(40);
      expect(p.y).toBeGreaterThanOrEqual(40);
    }
  });

  it("renders items at the touch point, selects, and closes on Escape", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<RadialMenu open label="도구" origin={{ x: 400, y: 300 }} items={items} onSelect={onSelect} onClose={onClose} viewport={{ width: 800, height: 600 }} />);
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    await userEvent.click(screen.getByRole("menuitem", { name: "지우개" }));
    expect(onSelect).toHaveBeenCalledWith("erase");
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    render(<RadialMenu open={false} label="도구" origin={{ x: 0, y: 0 }} items={items} onSelect={() => {}} onClose={() => {}} />);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("SplitBoard", () => {
  it.each([2, 3, 4] as const)("renders %i independent zones", (zones) => {
    render(<SplitBoard zones={zones} label="모둠 활동" renderZone={(i) => <p>문제 {i + 1}</p>} />);
    expect(screen.getAllByRole("region")).toHaveLength(zones);
    expect(screen.getByRole("group", { name: "모둠 활동" })).toHaveAttribute("data-zones", String(zones));
  });

  it("routes pointer input per zone, so a pen in one zone does not block touch in another", () => {
    const onInk = vi.fn();
    const onUi = vi.fn();
    render(<SplitBoard zones={2} label="모둠" renderZone={() => null} onInk={onInk} onUi={onUi} />);
    const [a, b] = screen.getAllByRole("region");
    fireEvent.pointerDown(a!, { pointerType: "pen", pointerId: 1 });
    fireEvent.pointerDown(b!, { pointerType: "touch", pointerId: 2, width: 10, height: 10 });
    expect(onInk).toHaveBeenCalledTimes(1);
    expect(onInk.mock.calls[0]![0]).toBe(0);
    expect(onUi).toHaveBeenCalledTimes(1);
    expect(onUi.mock.calls[0]![0]).toBe(1);
  });

  it("renders a footer per zone", () => {
    render(<SplitBoard zones={2} label="모둠" renderZone={() => null} renderFooter={(i) => <button>제출 {i + 1}</button>} />);
    expect(screen.getByRole("button", { name: "제출 2" })).toBeInTheDocument();
  });
});

describe("board touch targets", () => {
  const read = (path: string) => readFileSync(join(import.meta.dirname, "../src", path), "utf8");
  const css = (name: string) => read(`board/${name}`);

  it("sizes every interactive board element from --target-min", () => {
    expect(css("radial-menu.css")).toMatch(/\.oe-radial__item[^}]*min-height: var\(--target-min\)/s);
    expect(css("radial-menu.css")).toMatch(/\.oe-radial__item[^}]*min-width: var\(--target-min\)/s);
    expect(css("focus-curtain.css")).toMatch(/\.oe-curtain__handle[^}]*var\(--target-min\)/s);
    expect(read("primitives/button.css")).toMatch(/\.oe-button \{[^}]*min-height: var\(--target-min\)[^}]*min-width: var\(--target-min\)/s);
  });
});
