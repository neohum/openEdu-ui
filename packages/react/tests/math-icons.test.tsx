import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  EduIcon,
  EDU_ICON_CATEGORIES,
  EDU_ICON_MAP,
  EduIconName,
  MathSymbolIcon,
  MathSymbolName,
  MathSymbolToolbar,
  DEFAULT_MATH_SYMBOLS,
  resolveMathIconSize,
  resolveEduIconGlyph,
} from "../src/index.ts";

async function violations(container: Element) {
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`);
}

describe("MathSymbolIcon", () => {
  const allSymbols: Array<{
    name: MathSymbolName;
    Component: React.ComponentType<any>;
  }> = [
    { name: "fraction", Component: MathSymbolIcon.Fraction },
    { name: "sqrt", Component: MathSymbolIcon.Sqrt },
    { name: "superscript", Component: MathSymbolIcon.Superscript },
    { name: "subscript", Component: MathSymbolIcon.Subscript },
    { name: "parentheses", Component: MathSymbolIcon.Parentheses },
    { name: "brackets", Component: MathSymbolIcon.Brackets },
    { name: "curlyBraces", Component: MathSymbolIcon.CurlyBraces },
    { name: "integral", Component: MathSymbolIcon.Integral },
    { name: "sigma", Component: MathSymbolIcon.Sigma },
    { name: "infinity", Component: MathSymbolIcon.Infinity },
    { name: "pi", Component: MathSymbolIcon.Pi },
    { name: "trig", Component: MathSymbolIcon.Trig },
    { name: "angle", Component: MathSymbolIcon.Angle },
    { name: "triangle", Component: MathSymbolIcon.Triangle },
    { name: "square", Component: MathSymbolIcon.Square },
    { name: "circle", Component: MathSymbolIcon.Circle },
    { name: "parallel", Component: MathSymbolIcon.Parallel },
    { name: "perpendicular", Component: MathSymbolIcon.Perpendicular },
    { name: "plusMinus", Component: MathSymbolIcon.PlusMinus },
    { name: "divide", Component: MathSymbolIcon.Divide },
  ];

  it("renders all 20 compound math symbol icons with correct data-symbol attributes", () => {
    allSymbols.forEach(({ name, Component }) => {
      const { container, unmount } = render(<Component data-testid={`icon-${name}`} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("data-symbol", name);
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      unmount();
    });
  });

  it("renders via dynamic MathSymbolIcon name prop", () => {
    allSymbols.forEach(({ name }) => {
      const { container, unmount } = render(<MathSymbolIcon name={name} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("data-symbol", name);
      unmount();
    });
  });

  it("supports size presets and numeric sizes", () => {
    const { rerender } = render(<MathSymbolIcon.Sqrt size="sm" data-testid="sqrt" />);
    let svg = screen.getByTestId("sqrt");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
    expect(svg).toHaveAttribute("data-size", "sm");

    rerender(<MathSymbolIcon.Sqrt size="md" data-testid="sqrt" />);
    svg = screen.getByTestId("sqrt");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveAttribute("data-size", "md");

    rerender(<MathSymbolIcon.Sqrt size="lg" data-testid="sqrt" />);
    svg = screen.getByTestId("sqrt");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
    expect(svg).toHaveAttribute("data-size", "lg");

    rerender(<MathSymbolIcon.Sqrt size={48} data-testid="sqrt" />);
    svg = screen.getByTestId("sqrt");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
    expect(svg).not.toHaveAttribute("data-size");
  });

  it("resolves sizes accurately via helper", () => {
    expect(resolveMathIconSize("sm")).toBe(16);
    expect(resolveMathIconSize("md")).toBe(24);
    expect(resolveMathIconSize("lg")).toBe(32);
    expect(resolveMathIconSize(40)).toBe(40);
  });

  it("applies custom color, strokeWidth, and className", () => {
    render(
      <MathSymbolIcon.Fraction
        color="var(--color-accent)"
        strokeWidth={3}
        className="custom-fraction"
        data-testid="fraction"
      />,
    );
    const svg = screen.getByTestId("fraction");
    expect(svg).toHaveAttribute("stroke", "var(--color-accent)");
    expect(svg).toHaveAttribute("stroke-width", "3");
    expect(svg).toHaveClass("oe-math-symbol-icon");
    expect(svg).toHaveClass("custom-fraction");
  });

  it("provides accessible name when ariaLabel is set", () => {
    render(<MathSymbolIcon.Integral ariaLabel="적분 기호" />);
    const svg = screen.getByRole("img", { name: "적분 기호" });
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute("aria-hidden");
  });
});

describe("EduIcon", () => {
  it("renders classroom management icons with fi-rr-* classes", () => {
    EDU_ICON_CATEGORIES.management.forEach((name) => {
      const { container, unmount } = render(<EduIcon name={name} />);
      const el = container.querySelector("i");
      expect(el).not.toBeNull();
      expect(el).toHaveClass("fi");
      expect(el).toHaveClass(resolveEduIconGlyph(name));
      expect(el).toHaveAttribute("data-name", name);
      unmount();
    });
  });

  it("renders writing/tool icons with fi-rr-* classes", () => {
    EDU_ICON_CATEGORIES.writing.forEach((name) => {
      const { container, unmount } = render(<EduIcon name={name} />);
      const el = container.querySelector("i");
      expect(el).not.toBeNull();
      expect(el).toHaveClass("fi");
      expect(el).toHaveClass(resolveEduIconGlyph(name));
      expect(el).toHaveAttribute("data-name", name);
      unmount();
    });
  });

  it("renders evaluation/print icons with fi-rr-* classes", () => {
    EDU_ICON_CATEGORIES.evaluation.forEach((name) => {
      const { container, unmount } = render(<EduIcon name={name} />);
      const el = container.querySelector("i");
      expect(el).not.toBeNull();
      expect(el).toHaveClass("fi");
      expect(el).toHaveClass(resolveEduIconGlyph(name));
      expect(el).toHaveAttribute("data-name", name);
      unmount();
    });
  });

  it("maps known names to EDU_ICON_MAP definitions", () => {
    expect(resolveEduIconGlyph("clock")).toBe("fi-rr-clock");
    expect(resolveEduIconGlyph("timer")).toBe("fi-rr-timer");
    expect(resolveEduIconGlyph("pencil")).toBe("fi-rr-pencil");
    expect(resolveEduIconGlyph("print")).toBe("fi-rr-print");
    expect(resolveEduIconGlyph("custom-icon")).toBe("fi-rr-custom-icon");
    expect(resolveEduIconGlyph("fi-rr-test")).toBe("fi-rr-test");
  });

  it("supports size presets and numeric sizes", () => {
    const { rerender } = render(<EduIcon name="bell" size="sm" data-testid="bell" />);
    let el = screen.getByTestId("bell");
    expect(el).toHaveAttribute("data-size", "sm");

    rerender(<EduIcon name="bell" size="lg" data-testid="bell" />);
    el = screen.getByTestId("bell");
    expect(el).toHaveAttribute("data-size", "lg");

    rerender(<EduIcon name="bell" size={28} data-testid="bell" />);
    el = screen.getByTestId("bell");
    expect(el.style.getPropertyValue("--oe-icon-size")).toBe("28px");
  });

  it("renders accessible label when ariaLabel is provided", () => {
    render(<EduIcon name="star" ariaLabel="별점 아이콘" />);
    const el = screen.getByRole("img", { name: "별점 아이콘" });
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute("aria-hidden");
  });

  it("renders with aria-hidden=true when no accessible label is provided", () => {
    const { container } = render(<EduIcon name="check" />);
    const el = container.querySelector("i");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).not.toHaveAttribute("role");
  });
});

describe("MathSymbolToolbar", () => {
  it("renders toolbar with default 20 math symbols", () => {
    render(<MathSymbolToolbar />);
    const toolbar = screen.getByRole("toolbar", { name: "수식 기호 툴바" });
    expect(toolbar).toBeInTheDocument();

    const buttons = toolbar.querySelectorAll(".oe-math-toolbar__btn");
    expect(buttons.length).toBe(DEFAULT_MATH_SYMBOLS.length);
    expect(buttons.length).toBe(20);
  });

  it("calls onSelectSymbol with symbolText and latexSnippet when symbol is clicked", async () => {
    const onSelect = vi.fn();
    render(<MathSymbolToolbar onSelectSymbol={onSelect} />);

    // Click fraction button
    const fractionBtn = screen.getByRole("button", { name: /분수/ });
    await userEvent.click(fractionBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("a/b", "\\frac{a}{b}");

    // Click sqrt button
    const sqrtBtn = screen.getByRole("button", { name: /제곱근/ });
    await userEvent.click(sqrtBtn);
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith("√x", "\\sqrt{x}");

    // Click integral button
    const integralBtn = screen.getByRole("button", { name: /적분/ });
    await userEvent.click(integralBtn);
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenCalledWith("∫", "\\int");
  });

  it("filters symbols when category tabs are clicked", async () => {
    render(<MathSymbolToolbar />);

    // Initially "all" has 20 symbols
    const allTab = screen.getByRole("tab", { name: "전체" });
    expect(allTab).toHaveAttribute("aria-selected", "true");

    // Click "기하/도형" tab
    const geometryTab = screen.getByRole("tab", { name: "기하/도형" });
    await userEvent.click(geometryTab);
    expect(geometryTab).toHaveAttribute("aria-selected", "true");

    // Geometry symbols: angle, triangle, square, circle, parallel, perpendicular (6 items)
    const buttons = screen.getAllByRole("button").filter((b) => b.classList.contains("oe-math-toolbar__btn"));
    expect(buttons.length).toBe(6);
    expect(screen.getByRole("button", { name: /각도/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /삼각형/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /분수/ })).toBeNull();
  });

  it("supports controlled activeCategory and onCategoryChange", async () => {
    const onCategoryChange = vi.fn();
    const { rerender } = render(
      <MathSymbolToolbar activeCategory="algebra" onCategoryChange={onCategoryChange} />,
    );

    const algebraTab = screen.getByRole("tab", { name: "대수/수식" });
    expect(algebraTab).toHaveAttribute("aria-selected", "true");

    const calculusTab = screen.getByRole("tab", { name: "해석/함수" });
    await userEvent.click(calculusTab);
    expect(onCategoryChange).toHaveBeenCalledWith("calculus");

    // Switch controlled prop
    rerender(<MathSymbolToolbar activeCategory="calculus" onCategoryChange={onCategoryChange} />);
    expect(screen.getByRole("tab", { name: "해석/함수" })).toHaveAttribute("aria-selected", "true");
  });

  it("supports compact and disabled modes", () => {
    const onSelect = vi.fn();
    render(<MathSymbolToolbar compact disabled onSelectSymbol={onSelect} />);

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("data-compact", "true");

    const btns = screen.getAllByRole("button");
    btns.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("passes axe accessibility tests", async () => {
    const { container } = render(<MathSymbolToolbar />);
    expect(await violations(container)).toEqual([]);
  });
});
