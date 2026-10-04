import React from "react";
import { MathFraction } from "./math-fraction.tsx";

export interface MathFormulaProps extends React.HTMLAttributes<HTMLSpanElement> {
  expr?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  inline?: boolean;
}

/**
 * 교과서 표준 수식 (Math Formula) 컴포넌트
 * 컴퓨터 입력 방식(예: "1/2 + 1/3 = ?")을 감지하여 분수는 세로 분수로,
 * 연산자는 수학 표준 기호(+, −, ×, ÷, =)로, 변수는 이탤릭체(x, y)로
 * 실제 교과서 수학 수식 형태로 렌더링합니다.
 */
export function MathFormula({
  expr,
  children,
  size = "md",
  className = "",
  inline = true,
  ...props
}: MathFormulaProps) {
  const rawText = expr ?? (typeof children === "string" ? children : null);

  if (!rawText) {
    return (
      <span
        className={`oe-math-formula oe-math-formula--${size} ${inline ? "oe-math-formula--inline" : "oe-math-formula--block"} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }

  const tokens = rawText.split(/(\d+\/\d+|\+|\-|\*|\×|\÷|\=|\<|\>|\≤|\≥|\±|\?|\s+)/g).filter(Boolean);

  return (
    <span
      className={`oe-math-formula oe-math-formula--${size} ${inline ? "oe-math-formula--inline" : "oe-math-formula--block"} ${className}`}
      aria-label={rawText}
      {...props}
    >
      {tokens.map((token, index) => {
        const trimmed = token.trim();
        if (!trimmed) {
          return <span key={index} className="oe-math-formula__space" />;
        }

        // 1. Fraction
        const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
        if (fracMatch && fracMatch[1] && fracMatch[2]) {
          return (
            <MathFraction
              key={index}
              num={parseInt(fracMatch[1], 10)}
              den={parseInt(fracMatch[2], 10)}
              size={size}
            />
          );
        }

        // 2. Operators
        if (trimmed === "+") {
          return <span key={index} className="oe-math-formula__op">+</span>;
        }
        if (trimmed === "-") {
          return <span key={index} className="oe-math-formula__op">&minus;</span>;
        }
        if (trimmed === "*" || trimmed === "×") {
          return <span key={index} className="oe-math-formula__op">&times;</span>;
        }
        if (trimmed === "÷") {
          return <span key={index} className="oe-math-formula__op">&divide;</span>;
        }
        if (trimmed === "=") {
          return <span key={index} className="oe-math-formula__op oe-math-formula__eq">=</span>;
        }
        if (trimmed === "<" || trimmed === ">" || trimmed === "≤" || trimmed === "≥") {
          return <span key={index} className="oe-math-formula__op">{trimmed}</span>;
        }
        if (trimmed === "±") {
          return <span key={index} className="oe-math-formula__op">&plusmn;</span>;
        }

        // 3. Question placeholder
        if (trimmed === "?") {
          return <span key={index} className="oe-math-formula__placeholder">?</span>;
        }

        // 4. Variables
        const varMatch = trimmed.match(/^(\d*)([a-zA-Z])$/);
        if (varMatch) {
          return (
            <span key={index} className="oe-math-formula__var-wrap">
              {varMatch[1] && <span className="oe-math-formula__coeff">{varMatch[1]}</span>}
              <em className="oe-math-formula__var">{varMatch[2]}</em>
            </span>
          );
        }

        return <span key={index} className="oe-math-formula__num">{trimmed}</span>;
      })}
    </span>
  );
}
