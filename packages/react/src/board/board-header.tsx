import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export interface BoardHeaderProps {
  /** 현재 선택된 교시 (1~6 등, 제어 컴포넌트용) */
  period?: number;
  /** 초기 선택 교시 (비제어 컴포넌트용, 기본값: 1) */
  defaultPeriod?: number;
  /** 전체 표시할 교시 수 (기본값: 6) */
  totalPeriods?: number;
  /** 교시 변경 콜백 */
  onPeriodChange?: (period: number) => void;
  /** 과목명 (예: "수학") */
  subject?: string;
  /** 단원명 (예: "3. 분수의 덧셈과 뺄셈") */
  unit?: string;
  /** 학습문제 / 학습목표 */
  objective?: string;
  /** 학습문제 배지 라벨 (기본값: "학습문제") */
  objectiveLabel?: string;
  /** 실시간 시계 표시 여부 (기본값: true) */
  showClock?: boolean;
  /** 테스트 또는 고정 시각 표시용 초기 시각 */
  initialTime?: Date;
  /** 우측 추가 액션 영역 */
  actions?: ReactNode;
  /** 접근성 라벨 (기본값: "수업 칠판 헤더") */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function BoardHeader({
  period: controlledPeriod,
  defaultPeriod = 1,
  totalPeriods = 6,
  onPeriodChange,
  subject = "수학",
  unit,
  objective,
  objectiveLabel = "학습문제",
  showClock = true,
  initialTime,
  actions,
  label = "수업 칠판 헤더",
  className = "",
  style,
}: BoardHeaderProps) {
  const [internalPeriod, setInternalPeriod] = useState<number>(defaultPeriod);
  const currentPeriod = controlledPeriod ?? internalPeriod;

  const [now, setNow] = useState<Date>(() => initialTime ?? new Date());

  useEffect(() => {
    if (initialTime) {
      setNow(initialTime);
      return;
    }
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [initialTime]);

  const handleSelectPeriod = (p: number) => {
    if (controlledPeriod === undefined) {
      setInternalPeriod(p);
    }
    onPeriodChange?.(p);
  };

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeText = `${hours}:${minutes}`;

  const periods = Array.from({ length: Math.max(1, totalPeriods) }, (_, i) => i + 1);
  const rootClass = ["oe-board-header", className].filter(Boolean).join(" ");

  return (
    <header
      className={rootClass}
      style={style}
      aria-label={label}
      data-testid="board-header"
      data-period={currentPeriod}
    >
      <div className="oe-board-header__periods" role="group" aria-label="교시 선택">
        {periods.map((p) => {
          const active = p === currentPeriod;
          return (
            <button
              key={p}
              type="button"
              className="oe-board-header__period-chip"
              data-active={active ? "true" : undefined}
              aria-pressed={active}
              onClick={() => handleSelectPeriod(p)}
            >
              {p}교시
            </button>
          );
        })}
      </div>

      <div className="oe-board-header__meta">
        <div className="oe-board-header__subject-group">
          <span className="oe-board-header__subject" data-testid="board-header-subject">
            {subject}
          </span>
          {unit ? (
            <span className="oe-board-header__unit" data-testid="board-header-unit">
              {unit}
            </span>
          ) : null}
        </div>

        {objective ? (
          <div className="oe-board-header__objective" data-testid="board-header-objective">
            <span className="oe-board-header__objective-badge">{objectiveLabel}</span>
            <p className="oe-board-header__objective-text">{objective}</p>
          </div>
        ) : null}
      </div>

      <div className="oe-board-header__right">
        {showClock ? (
          <time
            className="oe-board-header__clock"
            dateTime={now.toISOString()}
            aria-label={`현재 시각 ${timeText}`}
            data-testid="board-header-clock"
          >
            {timeText}
          </time>
        ) : null}
        {actions ? <div className="oe-board-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
