export interface CutLineProps {
  /** 절취선 안내 레이블 (기본값: "절취선 (채점 후 학생 확인용)") */
  label?: string;
  /** 가위 아이콘 표시 여부 (기본값: true) */
  showScissors?: boolean;
  /** 절취선 방향 (기본값: "horizontal") */
  orientation?: "horizontal" | "vertical";
  /** 선 스타일: "dashed" | "dotted" (기본값: "dashed") */
  dashedStyle?: "dashed" | "dotted";
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function CutLine({
  label = "절취선 (채점 후 학생 확인용)",
  showScissors = true,
  orientation = "horizontal",
  dashedStyle = "dashed",
  className,
}: CutLineProps) {
  const rootClass = [
    "oe-cut-line",
    `oe-cut-line--${orientation}`,
    `oe-cut-line--${dashedStyle}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      role="separator"
      aria-label={label || "절취선"}
      data-testid="cut-line"
    >
      <div className="oe-cut-line__segment oe-cut-line__segment--before" />
      <div className="oe-cut-line__badge">
        {showScissors && (
          <i
            className="fi fi-rr-scissors oe-cut-line__icon"
            aria-hidden="true"
          />
        )}
        {label && <span className="oe-cut-line__label">{label}</span>}
      </div>
      <div className="oe-cut-line__segment oe-cut-line__segment--after" />
    </div>
  );
}
