import { describe, expect, it } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  SquareGridRow,
  FourLineRow,
  MathColumnForm,
  CpaTenFrame,
  LinedArea,
  WorksheetHeader,
} from "../src/worksheet/print-components.tsx";

describe("Print-First Worksheet Components (0.5pt)", () => {
  it("renders SquareGridRow with 10-cols and character guides", () => {
    render(<SquareGridRow cols={10} sampleText="바른글씨쓰기" number={1} />);
    expect(screen.getByText("1.")).toBeDefined();
    expect(screen.getByText("바")).toBeDefined();
    expect(screen.getByText("른")).toBeDefined();
  });

  it("renders FourLineRow with english handwriting guide", () => {
    render(<FourLineRow heightMm={11} sampleText="Apple" />);
    expect(screen.getByText("Apple")).toBeDefined();
  });

  it("renders MathColumnForm with carry and vertical calculation", () => {
    render(<MathColumnForm operation="+" topNum={125} bottomNum={348} carry={1} answer={473} />);
    expect(screen.getByText("+")).toBeDefined();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getByText("473")).toBeDefined();
  });

  it("renders CpaTenFrame with filled token label", () => {
    render(<CpaTenFrame filledCount={8} label="10개 묶음 상자" />);
    expect(screen.getByText(/10개 묶음 상자 \(8\/10\)/)).toBeDefined();
  });

  it("renders LinedArea with line numbers", () => {
    render(<LinedArea lineGapMm={10} lineCount={3} showNumbers={true} />);
    expect(screen.getByText("(1)")).toBeDefined();
    expect(screen.getByText("(2)")).toBeDefined();
    expect(screen.getByText("(3)")).toBeDefined();
  });

  it("renders WorksheetHeader with unit and title", () => {
    render(<WorksheetHeader title="수학 형성평가" unit="4단원. 분수" />);
    expect(screen.getByText("수학 형성평가")).toBeDefined();
    expect(screen.getByText("4단원. 분수")).toBeDefined();
    expect(screen.getByText("확인")).toBeDefined();
  });
});
