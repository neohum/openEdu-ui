import React, { forwardRef, useState } from "react";
import {
  MathSymbolIcon,
  MathSymbolName,
  MathSymbolSize,
} from "./math-symbol-icons.tsx";

export type MathToolbarCategory = "all" | "algebra" | "calculus" | "geometry" | "operators";

export interface MathSymbolItem {
  id: MathSymbolName;
  label: string;
  symbolText: string;
  latexSnippet: string;
  category: "algebra" | "calculus" | "geometry" | "operators";
}

export const DEFAULT_MATH_SYMBOLS: MathSymbolItem[] = [
  // 1. 대수 & 거듭제곱 & 괄호 (Algebra)
  { id: "fraction", label: "분수", symbolText: "a/b", latexSnippet: "\\frac{a}{b}", category: "algebra" },
  { id: "sqrt", label: "제곱근", symbolText: "√x", latexSnippet: "\\sqrt{x}", category: "algebra" },
  { id: "superscript", label: "지수(거듭제곱)", symbolText: "x^n", latexSnippet: "^{n}", category: "algebra" },
  { id: "subscript", label: "아래첨자", symbolText: "x_n", latexSnippet: "_{n}", category: "algebra" },
  { id: "parentheses", label: "소괄호", symbolText: "( )", latexSnippet: "\\left( x \\right)", category: "algebra" },
  { id: "brackets", label: "대괄호", symbolText: "[ ]", latexSnippet: "\\left[ x \\right]", category: "algebra" },
  { id: "curlyBraces", label: "중괄호", symbolText: "{ }", latexSnippet: "\\left\\{ x \\right\\}", category: "algebra" },

  // 2. 해석 & 함수 (Calculus)
  { id: "integral", label: "적분", symbolText: "∫", latexSnippet: "\\int", category: "calculus" },
  { id: "sigma", label: "합(시그마)", symbolText: "∑", latexSnippet: "\\sum", category: "calculus" },
  { id: "infinity", label: "무한대", symbolText: "∞", latexSnippet: "\\infty", category: "calculus" },
  { id: "pi", label: "파이", symbolText: "π", latexSnippet: "\\pi", category: "calculus" },
  { id: "trig", label: "삼각함수(sin)", symbolText: "sin", latexSnippet: "\\sin", category: "calculus" },

  // 3. 기하 (Geometry)
  { id: "angle", label: "각도", symbolText: "∠", latexSnippet: "\\angle", category: "geometry" },
  { id: "triangle", label: "삼각형", symbolText: "△", latexSnippet: "\\triangle", category: "geometry" },
  { id: "square", label: "사각형", symbolText: "□", latexSnippet: "\\square", category: "geometry" },
  { id: "circle", label: "원", symbolText: "○", latexSnippet: "\\bigcirc", category: "geometry" },
  { id: "parallel", label: "평행", symbolText: "∥", latexSnippet: "\\parallel", category: "geometry" },
  { id: "perpendicular", label: "수직", symbolText: "⊥", latexSnippet: "\\perp", category: "geometry" },

  // 4. 연산자 (Operators)
  { id: "plusMinus", label: "플러스마이너스", symbolText: "±", latexSnippet: "\\pm", category: "operators" },
  { id: "divide", label: "나눗셈", symbolText: "÷", latexSnippet: "\\div", category: "operators" },
];

export const CATEGORY_LABELS: Record<MathToolbarCategory, string> = {
  all: "전체",
  algebra: "대수/수식",
  calculus: "해석/함수",
  geometry: "기하/도형",
  operators: "연산자",
};

export interface MathSymbolToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelectSymbol?: (symbolText: string, latexSnippet: string) => void;
  symbols?: MathSymbolItem[];
  showCategories?: boolean;
  activeCategory?: MathToolbarCategory;
  defaultCategory?: MathToolbarCategory;
  onCategoryChange?: (category: MathToolbarCategory) => void;
  compact?: boolean;
  disabled?: boolean;
  iconSize?: MathSymbolSize;
  ariaLabel?: string;
}

export const MathSymbolToolbar = forwardRef<HTMLDivElement, MathSymbolToolbarProps>(
  (
    {
      onSelectSymbol,
      symbols = DEFAULT_MATH_SYMBOLS,
      showCategories = true,
      activeCategory: controlledCategory,
      defaultCategory = "all",
      onCategoryChange,
      compact = false,
      disabled = false,
      iconSize = "md",
      ariaLabel = "수식 기호 툴바",
      className,
      ...rest
    },
    ref,
  ) => {
    const [internalCategory, setInternalCategory] = useState<MathToolbarCategory>(defaultCategory);
    const currentCategory = controlledCategory ?? internalCategory;

    const handleCategoryClick = (category: MathToolbarCategory) => {
      if (controlledCategory === undefined) {
        setInternalCategory(category);
      }
      onCategoryChange?.(category);
    };

    const filteredSymbols =
      currentCategory === "all"
        ? symbols
        : symbols.filter((item) => item.category === currentCategory);

    const categories: MathToolbarCategory[] = ["all", "algebra", "calculus", "geometry", "operators"];

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={ariaLabel}
        data-compact={compact ? "true" : undefined}
        className={["oe-math-toolbar", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {showCategories && (
          <div className="oe-math-toolbar__categories" role="tablist" aria-label="수식 기호 분류">
            {categories.map((cat) => {
              const isActive = currentCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-active={isActive ? "true" : undefined}
                  disabled={disabled}
                  className="oe-math-toolbar__cat-btn"
                  onClick={() => handleCategoryClick(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        )}

        <div className="oe-math-toolbar__grid" role="group" aria-label="수식 기호 목록">
          {filteredSymbols.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              title={`${item.label} (${item.symbolText})`}
              aria-label={`${item.label} (${item.symbolText})`}
              data-symbol={item.id}
              className="oe-math-toolbar__btn"
              onClick={() => onSelectSymbol?.(item.symbolText, item.latexSnippet)}
            >
              <MathSymbolIcon name={item.id} size={compact ? "sm" : iconSize} />
            </button>
          ))}
        </div>
      </div>
    );
  },
);

MathSymbolToolbar.displayName = "MathSymbolToolbar";
