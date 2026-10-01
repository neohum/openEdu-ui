import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { BaseTenBlocks, FractionBar, NumberLine, snapValue } from "../src/index.ts";

const count = (unit: number) => document.querySelectorAll(`.oe-block[data-unit="${unit}"]`).length;

describe("BaseTenBlocks — number ⇄ blocks", () => {
  it("shows blocks for the typed number", async () => {
    render(<BaseTenBlocks defaultValue={0} />);
    const input = screen.getByLabelText("수");
    await userEvent.clear(input);
    await userEvent.type(input, "237");
    expect([count(100), count(10), count(1)]).toEqual([2, 3, 7]);
  });

  it("updates the number when a block is added or removed", async () => {
    const onChange = vi.fn();
    render(<BaseTenBlocks defaultValue={19} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "일 블록 추가" }));
    expect(screen.getByLabelText("수")).toHaveValue("20");
    expect([count(10), count(1)]).toEqual([2, 0]);
    await userEvent.click(screen.getByRole("button", { name: "십 블록 제거" }));
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(screen.getByLabelText("수")).toHaveValue("10");
  });

  it("clamps to max and disables impossible actions", async () => {
    render(<BaseTenBlocks defaultValue={999} />);
    expect(screen.getByRole("button", { name: "백 블록 추가" })).toBeDisabled();
    await userEvent.clear(screen.getByLabelText("수"));
    await userEvent.type(screen.getByLabelText("수"), "5000");
    expect(count(100)).toBe(9);
    expect(screen.getByRole("button", { name: "백 블록 제거" })).toBeEnabled();
  });

  it("works with the keyboard alone", async () => {
    render(<BaseTenBlocks defaultValue={0} />);
    await userEvent.tab(); // input
    await userEvent.tab(); // 백 추가
    await userEvent.keyboard("{Enter}");
    expect(screen.getByLabelText("수")).toHaveValue("100");
  });

  it("is controlled when value is given", () => {
    const { rerender } = render(<BaseTenBlocks value={12} />);
    expect([count(10), count(1)]).toEqual([1, 2]);
    rerender(<BaseTenBlocks value={30} />);
    expect([count(10), count(1)]).toEqual([3, 0]);
  });
});

describe("FractionBar", () => {
  it("fills parts up to the clicked one and toggles the last part off", async () => {
    const onChange = vi.fn();
    render(<FractionBar denominator={4} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3/4" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole("button", { name: "2/4" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "4/4" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("3/4");
    await userEvent.click(screen.getByRole("button", { name: "3/4" }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("adds and removes parts by keyboard-reachable buttons within bounds", async () => {
    render(<FractionBar denominator={2} defaultValue={2} />);
    expect(screen.getByRole("button", { name: "조각 추가" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "조각 제거" }));
    expect(screen.getByRole("status")).toHaveTextContent("1/2");
  });
});

describe("NumberLine", () => {
  it("snapValue maps positions to the nearest grid value", () => {
    const grid = { min: 0, max: 10, step: 1 };
    expect(snapValue(0.34, grid)).toBe(3);
    expect(snapValue(0.36, grid)).toBe(4);
    expect(snapValue(-1, grid)).toBe(0);
    expect(snapValue(2, grid)).toBe(10);
    expect(snapValue(0.52, { min: 0, max: 100, step: 25 })).toBe(50);
  });

  function setup() {
    const onChange = vi.fn();
    const { container } = render(<NumberLine min={0} max={10} onChange={onChange} />);
    const line = container.firstElementChild as HTMLElement;
    line.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 100 }) as DOMRect;
    return { onChange, line, counter: screen.getByRole("slider", { name: "수직선" }) };
  }

  it("follows the pointer while dragging and snaps on release", () => {
    const { onChange, line, counter } = setup();
    fireEvent.pointerDown(counter, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(counter, { clientX: 342 });
    expect(line.style.getPropertyValue("--oe-pos")).toBe("34.2%");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(counter, { clientX: 342 });
    expect(onChange).toHaveBeenCalledWith(3);
    expect(counter).toHaveAttribute("aria-valuenow", "3");
    expect(line.style.getPropertyValue("--oe-pos")).toBe("30%");
  });

  it("moves with arrow keys, Home and End", async () => {
    const { counter } = setup();
    counter.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(counter).toHaveAttribute("aria-valuenow", "2");
    await userEvent.keyboard("{End}");
    expect(counter).toHaveAttribute("aria-valuenow", "10");
    await userEvent.keyboard("{ArrowRight}");
    expect(counter).toHaveAttribute("aria-valuenow", "10");
    await userEvent.keyboard("{Home}");
    expect(counter).toHaveAttribute("aria-valuenow", "0");
  });

  it("can be bound to a shared number with other manipulatives", async () => {
    function Linked() {
      const [n, setN] = useState(4);
      return (
        <>
          <BaseTenBlocks value={n} onChange={setN} max={10} />
          <NumberLine min={0} max={10} value={n} onChange={setN} />
        </>
      );
    }
    render(<Linked />);
    await userEvent.click(screen.getByRole("button", { name: "일 블록 추가" }));
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "5");
  });
});
