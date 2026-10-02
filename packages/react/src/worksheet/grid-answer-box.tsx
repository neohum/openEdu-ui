import { useId, type ReactNode } from "react";

export interface GridAnswerBoxProps {
  /**
   * 모눈 격자 단위 크기
   * - `"5mm"` | `"8mm"` | `"10mm"` 또는 임의의 CSS 길이 문자열/숫자(숫자는 mm 단위)
   * - 기본값: `"10mm"`
   */
  gridSize?: "5mm" | "8mm" | "10mm" | string | number;
  /** 행(세로 칸) 수. 지정 시 높이가 `gridSize * rows`로 자동 계산됩니다. */
  rows?: number;
  /** 열(가로 칸) 수. 지정 시 너비가 `gridSize * cols`로 고정됩니다. */
  cols?: number;
  /** 상단 안내 레이블 (기본값: "풀이 과정을 자세히 쓰시오.") */
  label?: string;
  /** 세밀한 보조선(서브 그리드) 표시 여부 (기본값: false) */
  subGrid?: boolean;
  /** 최종 정답 기재란 표시 여부 (기본값: false) */
  showAnswerLine?: boolean;
  /** 최종 정답 기재란 레이블 (기본값: "답:") */
  answerLabel?: string;
  /** 최종 정답 기재값 (제어용) */
  answerValue?: string;
  /** 박스 최소 높이 (기본값: "160px", rows 지정 시 무시됨) */
  minHeight?: string | number;
  /** 내부 커스텀 컨텐츠 */
  children?: ReactNode;
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function GridAnswerBox({
  gridSize = "10mm",
  rows,
  cols,
  label = "풀이 과정을 자세히 쓰시오.",
  subGrid = false,
  showAnswerLine = false,
  answerLabel = "답:",
  answerValue,
  minHeight = "160px",
  children,
  className,
}: GridAnswerBoxProps) {
  const patternId = useId().replace(/:/g, "_");
  const subPatternId = `${patternId}_sub`;

  const parsedGridSize =
    typeof gridSize === "number" ? `${gridSize}mm` : gridSize;

  const boxStyle: React.CSSProperties = {
    minHeight: rows ? `calc(${parsedGridSize} * ${rows})` : minHeight,
    width: cols ? `calc(${parsedGridSize} * ${cols})` : "100%",
  };

  const rootClass = ["oe-grid-answer-box", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} data-testid="grid-answer-box">
      {/* Label Bar */}
      {label && (
        <div className="oe-grid-answer-box__header">
          <span className="oe-grid-answer-box__label">
            <i className="fi fi-rr-edit oe-grid-answer-box__label-icon" aria-hidden="true" />
            {label}
          </span>
        </div>
      )}

      {/* SVG-based vector grid background */}
      <div className="oe-grid-answer-box__area" style={boxStyle}>
        <svg
          className="oe-grid-answer-box__svg"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {subGrid && (
              <pattern
                id={subPatternId}
                width={`calc(${parsedGridSize} / 2)`}
                height={`calc(${parsedGridSize} / 2)`}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M calc(${parsedGridSize} / 2) 0 L 0 0 0 calc(${parsedGridSize} / 2)`}
                  fill="none"
                  className="oe-grid-answer-box__subline"
                  strokeWidth="0.5"
                />
              </pattern>
            )}
            <pattern
              id={patternId}
              width={parsedGridSize}
              height={parsedGridSize}
              patternUnits="userSpaceOnUse"
            >
              {subGrid && (
                <rect
                  width={parsedGridSize}
                  height={parsedGridSize}
                  fill={`url(#${subPatternId})`}
                />
              )}
              <path
                d={`M ${parsedGridSize} 0 L 0 0 0 ${parsedGridSize}`}
                fill="none"
                className="oe-grid-answer-box__line"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>

        {children && <div className="oe-grid-answer-box__content">{children}</div>}
      </div>

      {/* Optional Answer Line */}
      {showAnswerLine && (
        <div className="oe-grid-answer-box__answer-footer">
          <span className="oe-grid-answer-box__answer-label">{answerLabel}</span>
          <span className="oe-grid-answer-box__answer-field">
            {answerValue || <span className="oe-grid-answer-box__answer-blank" />}
          </span>
        </div>
      )}
    </div>
  );
}
