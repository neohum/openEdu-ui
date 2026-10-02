import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdaptiveDock, InkToolbar, inkColorToken, type InkToolbarProps } from "../src/index.ts";

const base = (over: Partial<InkToolbarProps> = {}): InkToolbarProps => ({
  tool: "pen",
  onToolChange: vi.fn(),
  color: 1,
  onColorChange: vi.fn(),
  size: 4,
  onSizeChange: vi.fn(),
  canUndo: true,
  canRedo: false,
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onClear: vi.fn(),
  ...over,
});

const runAxe = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

afterEach(() => vi.useRealTimers());

describe("InkToolbar", () => {
  it("renders every group with accessible names", () => {
    render(<InkToolbar {...base()} />);
    expect(screen.getByRole("toolbar", { name: "판서 도구" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "도구" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "색상" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "굵기" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "작업" })).toBeInTheDocument();
    for (const name of ["펜", "형광펜", "지우개", "되돌리기", "다시 실행", "모두 지우기"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("gives every control an accessible name", () => {
    render(<InkToolbar {...base()} />);
    const toolbar = screen.getByRole("toolbar");
    const controls = [...within(toolbar).queryAllByRole("button"), ...within(toolbar).queryAllByRole("radio")];
    expect(controls).toHaveLength(3 + 6 + 4 + 3);
    for (const el of controls) expect(el).toHaveAccessibleName();
  });

  it("switches tools and reflects the controlled tool in aria-pressed", async () => {
    const onToolChange = vi.fn();
    const { rerender } = render(<InkToolbar {...base({ onToolChange })} />);
    expect(screen.getByRole("button", { name: "펜" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "형광펜" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("button", { name: "형광펜" }));
    expect(onToolChange).toHaveBeenCalledWith("highlighter");
    // controlled: nothing changes until the parent re-renders
    expect(screen.getByRole("button", { name: "형광펜" })).toHaveAttribute("aria-pressed", "false");
    rerender(<InkToolbar {...base({ onToolChange, tool: "highlighter" })} />);
    expect(screen.getByRole("button", { name: "형광펜" })).toHaveAttribute("aria-pressed", "true");
  });

  it("exposes the color radiogroup with aria-checked and roving tabindex", () => {
    render(<InkToolbar {...base({ color: 3 })} />);
    const radios = within(screen.getByRole("radiogroup", { name: "색상" })).getAllByRole("radio");
    expect(radios).toHaveLength(6);
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "false", "true", "false", "false", "false"]);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, -1, 0, -1, -1, -1]);
  });

  it("moves color with arrow keys and wraps at both ends", async () => {
    const onColorChange = vi.fn();
    const { rerender } = render(<InkToolbar {...base({ color: 6, onColorChange })} />);
    screen.getByRole("radio", { name: "색상 6" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onColorChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole("radio", { name: "색상 1" })).toHaveFocus();
    rerender(<InkToolbar {...base({ color: 1, onColorChange })} />);
    await userEvent.keyboard("{ArrowLeft}");
    expect(onColorChange).toHaveBeenLastCalledWith(6);
    await userEvent.keyboard("{ArrowDown}");
    expect(onColorChange).toHaveBeenLastCalledWith(2);
    await userEvent.keyboard("{End}");
    expect(onColorChange).toHaveBeenLastCalledWith(6);
  });

  it("maps swatches to --ink-N tokens", () => {
    render(<InkToolbar {...base()} />);
    expect(screen.getByRole("radio", { name: "색상 4" })).toHaveAttribute("data-ink", "4");
    expect(inkColorToken(4)).toBe("--ink-4");
  });

  it("hides the color swatches for the eraser", () => {
    render(<InkToolbar {...base({ tool: "eraser" })} />);
    expect(screen.queryByRole("radiogroup", { name: "색상" })).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "굵기" })).toBeInTheDocument();
  });

  it("selects sizes by click and keyboard, driving the dot via --oe-ink-dot", async () => {
    const onSizeChange = vi.fn();
    render(<InkToolbar {...base({ size: 4, onSizeChange })} />);
    const sizes = within(screen.getByRole("radiogroup", { name: "굵기" })).getAllByRole("radio");
    expect(sizes.map((s) => s.style.getPropertyValue("--oe-ink-dot"))).toEqual(["2px", "4px", "8px", "14px"]);
    expect(sizes[1]).toHaveAttribute("aria-checked", "true");
    await userEvent.click(sizes[3]!);
    expect(onSizeChange).toHaveBeenLastCalledWith(14);
    sizes[1]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onSizeChange).toHaveBeenLastCalledWith(8);
  });

  it("accepts a custom size list", () => {
    render(<InkToolbar {...base({ sizes: [1, 3], size: 3 })} />);
    expect(within(screen.getByRole("radiogroup", { name: "굵기" })).getAllByRole("radio")).toHaveLength(2);
  });

  it("disables undo and redo from props and fires them when enabled", async () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    render(<InkToolbar {...base({ canUndo: true, canRedo: false, onUndo, onRedo })} />);
    expect(screen.getByRole("button", { name: "다시 실행" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "되돌리기" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "다시 실행" }));
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("applies custom labels", () => {
    render(
      <InkToolbar
        {...base()}
        label="Ink"
        labels={{ pen: "Pen", color: "Color", size: "Width", clear: "Clear all", clearConfirm: "Sure?" }}
      />,
    );
    expect(screen.getByRole("toolbar", { name: "Ink" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pen" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Color 2" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Width 8" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
  });

  it("does not render export button when onExport is omitted", () => {
    render(<InkToolbar {...base()} />);
    expect(screen.queryByRole("button", { name: "내보내기" })).toBeNull();
  });

  it("renders export button with default label and fires onExport on click", async () => {
    const onExport = vi.fn();
    render(<InkToolbar {...base({ onExport })} />);
    const btn = screen.getByRole("button", { name: "내보내기" });
    expect(btn).toBeInTheDocument();
    expect(btn.querySelector(".ph-download-simple")).toBeInTheDocument();

    await userEvent.click(btn);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("supports custom export label", () => {
    const onExport = vi.fn();
    render(<InkToolbar {...base({ onExport, labels: { export: "저장하기" } })} />);
    expect(screen.getByRole("button", { name: "저장하기" })).toBeInTheDocument();
  });
});

describe("InkToolbar clear confirmation", () => {
  it("requires a second press within 3 seconds", () => {
    vi.useFakeTimers();
    const onClear = vi.fn();
    render(<InkToolbar {...base({ onClear })} />);
    act(() => screen.getByRole("button", { name: "모두 지우기" }).click());
    expect(onClear).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("정말 지울까요?");
    act(() => vi.advanceTimersByTime(2999));
    act(() => screen.getByRole("button", { name: "정말 지울까요?" }).click());
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "모두 지우기" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("resets without clearing when the timeout elapses", () => {
    vi.useFakeTimers();
    const onClear = vi.fn();
    render(<InkToolbar {...base({ onClear })} />);
    act(() => screen.getByRole("button", { name: "모두 지우기" }).click());
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole("button", { name: "모두 지우기" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "모두 지우기" }).click());
    expect(onClear).not.toHaveBeenCalled();
  });
});

describe("InkToolbar accessibility (axe)", () => {
  it("has no violations standalone", async () => {
    const { container } = render(<InkToolbar {...base()} />);
    expect(await runAxe(container)).toEqual([]);
  });

  it("has no violations with the eraser selected or while confirming clear", async () => {
    const { container } = render(<InkToolbar {...base({ tool: "eraser" })} />);
    await userEvent.click(screen.getByRole("button", { name: "모두 지우기" }));
    expect(await runAxe(container)).toEqual([]);
  });

  it("has no violations inside AdaptiveDock", async () => {
    const { container } = render(
      <AdaptiveDock label="도구" viewport={{ width: 1920, height: 1080 }}>
        <InkToolbar {...base()} />
      </AdaptiveDock>,
    );
    expect(screen.getByRole("toolbar", { name: "판서 도구" })).toBeInTheDocument();
    expect(await runAxe(container)).toEqual([]);
  });

  it("has no violations when onExport is provided", async () => {
    const { container } = render(<InkToolbar {...base({ onExport: vi.fn() })} />);
    expect(await runAxe(container)).toEqual([]);
  });
});

describe("ink toolbar touch targets", () => {
  const css = readFileSync(join(import.meta.dirname, "../src/ink/ink-toolbar.css"), "utf8");

  it("sizes every interactive ink control from --target-min", () => {
    expect(css).toMatch(/\.oe-ink__swatch,\s*\.oe-ink__size \{[^}]*min-height: var\(--target-min\)[^}]*min-width: var\(--target-min\)/s);
    expect(css).toMatch(/\.oe-ink__clear \{[^}]*min-height: var\(--target-min\)[^}]*min-width: var\(--target-min\)/s);
  });

  it("uses only token variables for color", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(css).toMatch(/background: var\(--oe-ink-swatch\)/);
    for (let n = 1; n <= 6; n++) expect(css).toContain(`--oe-ink-swatch: var(--ink-${n})`);
  });
});
