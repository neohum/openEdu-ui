import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MathFraction, MathFormula } from "../src/math/index.ts";

afterEach(() => {
  cleanup();
});

describe("MathFraction in @openedu/react", () => {
  it("renders numerator and denominator as authentic vertical fraction", () => {
    render(<MathFraction num={1} den={2} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByLabelText("2분의 1")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("supports mixed fractions", () => {
    render(<MathFraction whole={3} num={1} den={4} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByLabelText("3과 4분의 1")).toBeInTheDocument();
  });
});

describe("MathFormula in @openedu/react", () => {
  it("parses computer input format into textbook math format", () => {
    render(<MathFormula expr="1/2 + 1/3 = ?" size="lg" />);
    expect(screen.getByLabelText("2분의 1")).toBeInTheDocument();
    expect(screen.getByLabelText("3분의 1")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("=")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
