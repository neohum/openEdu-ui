export type ScoreBadgeVariant = "bracket" | "pill" | "outline";

export interface ScoreBadgeProps {
  /** 배점 수치 (예: 3, 4.5, "10") */
  score: number | string;
  /** 문항 유형 또는 배점 구분 레이블 (예: "서술형", "배점", "단답형") */
  label?: string;
  /**
   * 뱃지 표시 형태
   * - `bracket`: 대괄호 형태 (기본값, 예: `[3점]`, `[서술형 10점]`)
   * - `pill`: 둥근 캡슐 뱃지 형태
   * - `outline`: 실선 테두리 사각형 뱃지 형태
   */
  variant?: ScoreBadgeVariant;
  /** 점수 단위 (기본값: "점") */
  unit?: string;
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function ScoreBadge({
  score,
  label,
  variant = "bracket",
  unit = "점",
  className,
}: ScoreBadgeProps) {
  const rootClass = [
    "oe-score-badge",
    `oe-score-badge--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentText = label ? `${label} ${score}${unit}` : `${score}${unit}`;

  if (variant === "bracket") {
    return (
      <span className={rootClass} data-testid="score-badge" data-variant={variant}>
        <span className="oe-score-badge__bracket">[</span>
        {label && <span className="oe-score-badge__label">{label} </span>}
        <span className="oe-score-badge__score">{score}</span>
        <span className="oe-score-badge__unit">{unit}</span>
        <span className="oe-score-badge__bracket">]</span>
      </span>
    );
  }

  return (
    <span className={rootClass} data-testid="score-badge" data-variant={variant}>
      {label && <span className="oe-score-badge__label">{label} </span>}
      <span className="oe-score-badge__score">{score}</span>
      <span className="oe-score-badge__unit">{unit}</span>
    </span>
  );
}
