import React from "react";

export interface MathFractionProps extends React.HTMLAttributes<HTMLSpanElement> {
  num: number | string;
  den: number | string;
  whole?: number | string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

function getKoreanJosa(num: number | string): string {
  const str = String(num).trim();
  const lastChar = str.slice(-1);
  if (['1', '3', '6', '7', '8', '0'].includes(lastChar)) {
    return '과';
  }
  return '와';
}

/**
 * 교과서 표준 세로 분수 (Math Fraction) 컴포넌트
 * 1/2 등의 컴퓨터 입력 방식이 아닌, 분자와 분모가 위아래로 나뉘고
 * 가운데 수평 분수선이 있는 실제 수학 분수 형태로 렌더링합니다.
 */
export function MathFraction({
  num,
  den,
  whole,
  size = "md",
  className = "",
  ...props
}: MathFractionProps) {
  const fullText = `${whole !== undefined ? `${whole} ` : ""}${num}/${den}`;
  const ariaLabel = whole !== undefined
    ? `${whole}${getKoreanJosa(whole)} ${den}분의 ${num}`
    : `${den}분의 ${num}`;

  return (
    <span
      className={`oe-math-fraction oe-math-fraction--${size} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      <span className="oe-visually-hidden">{fullText}</span>
      <span className="oe-math-fraction__visual" aria-hidden="true">
        {whole !== undefined && <span className="oe-math-fraction__whole">{whole}</span>}
        <span className="oe-math-fraction__stack">
          <span className="oe-math-fraction__num">{num}</span>
          <span className="oe-math-fraction__bar" />
          <span className="oe-math-fraction__den">{den}</span>
        </span>
      </span>
    </span>
  );
}
