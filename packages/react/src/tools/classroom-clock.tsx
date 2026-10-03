import { useEffect, useState, useMemo, type CSSProperties } from "react";

export interface PeriodSchedule {
  period: number | string;
  name: string;
  startTime: string; // "HH:MM" 24h format
  endTime: string;   // "HH:MM" 24h format
  isBreak?: boolean;
}

export const DEFAULT_PERIOD_SCHEDULE: PeriodSchedule[] = [
  { period: 1, name: "1교시", startTime: "09:00", endTime: "09:40" },
  { period: "break-1", name: "쉬는시간", startTime: "09:40", endTime: "09:50", isBreak: true },
  { period: 2, name: "2교시", startTime: "09:50", endTime: "10:30" },
  { period: "break-2", name: "쉬는시간", startTime: "10:30", endTime: "10:40", isBreak: true },
  { period: 3, name: "3교시", startTime: "10:40", endTime: "11:20" },
  { period: "break-3", name: "쉬는시간", startTime: "11:20", endTime: "11:30", isBreak: true },
  { period: 4, name: "4교시", startTime: "11:30", endTime: "12:10" },
  { period: "lunch", name: "점심시간", startTime: "12:10", endTime: "13:00", isBreak: true },
  { period: 5, name: "5교시", startTime: "13:00", endTime: "13:40" },
  { period: "break-5", name: "쉬는시간", startTime: "13:40", endTime: "13:50", isBreak: true },
  { period: 6, name: "6교시", startTime: "13:50", endTime: "14:30" },
  { period: "homeroom", name: "종례/방과후", startTime: "14:30", endTime: "15:10" },
];

function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getPeriodStatus(now: Date, schedules: PeriodSchedule[] = DEFAULT_PERIOD_SCHEDULE) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < schedules.length; i++) {
    const item = schedules[i];
    if (!item) continue;
    const start = timeStrToMinutes(item.startTime);
    const end = timeStrToMinutes(item.endTime);

    if (currentMinutes >= start && currentMinutes < end) {
      const remainingMinutes = end - currentMinutes;
      const totalDuration = end - start;
      const elapsedMinutes = currentMinutes - start;
      const progressPercent = Math.min(100, Math.max(0, (elapsedMinutes / totalDuration) * 100));

      return {
        item,
        status: item.isBreak ? ("break" as const) : ("class" as const),
        label: item.name,
        timeRange: `${item.startTime} ~ ${item.endTime}`,
        remainingMinutes,
        progressPercent,
      };
    }
  }

  // If before first schedule
  const first = schedules[0];
  if (first && currentMinutes < timeStrToMinutes(first.startTime)) {
    const diff = timeStrToMinutes(first.startTime) - currentMinutes;
    return {
      item: null,
      status: "before" as const,
      label: "수업 전 (준비 시간)",
      timeRange: `등교 ~ ${first.startTime}`,
      remainingMinutes: diff,
      progressPercent: 0,
    };
  }

  // After all schedules
  return {
    item: null,
    status: "after" as const,
    label: "방과 후 / 일과 종료",
    timeRange: "일과 마침",
    remainingMinutes: 0,
    progressPercent: 100,
  };
}

export interface ClassroomClockProps {
  /** Optional fixed date for testing or SSR */
  initialTime?: Date;
  /** Whether to show in 24-hour format initially (default: false) */
  defaultIs24Hour?: boolean;
  /** Whether to show seconds in digital clock (default: true) */
  defaultShowSeconds?: boolean;
  /** Custom schedule list */
  schedules?: PeriodSchedule[];
  /** Override the current period badge label */
  currentPeriodLabel?: string;
  /** Display mode */
  mode?: "both" | "analog" | "digital";
  className?: string;
  style?: CSSProperties;
}

export function ClassroomClock({
  initialTime,
  defaultIs24Hour = false,
  defaultShowSeconds = true,
  schedules = DEFAULT_PERIOD_SCHEDULE,
  currentPeriodLabel,
  mode = "both",
  className = "",
  style,
}: ClassroomClockProps) {
  const [time, setTime] = useState<Date>(() => initialTime || new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(defaultIs24Hour);
  const [showSeconds, setShowSeconds] = useState<boolean>(defaultShowSeconds);

  useEffect(() => {
    // Only update if initialTime is not static prop (or initialTime changes)
    if (initialTime) {
      setTime(initialTime);
      return;
    }

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [initialTime]);

  const periodInfo = useMemo(() => {
    return getPeriodStatus(time, schedules);
  }, [time, schedules]);

  // Analog clock hand degrees
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
  const minuteDeg = (minutes + seconds / 60) * 6;
  const secondDeg = seconds * 6;

  // Digital clock formatting
  const displayHours = is24Hour
    ? String(hours).padStart(2, "0")
    : String(hours % 12 === 0 ? 12 : hours % 12).padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(seconds).padStart(2, "0");

  const dateString = time.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div
      className={`oe-classroom-clock ${className}`}
      style={style}
      data-testid="classroom-clock"
      data-mode={mode}
    >
      {/* Top Period Badge Banner */}
      <div className="oe-clock__period-card" data-status={periodInfo.status}>
        <div className="oe-clock__period-header">
          <span className="oe-clock__period-badge">
            <i className="fi fi-rr-bookmark" aria-hidden="true" />
            <span className="oe-clock__period-title">
              {currentPeriodLabel || periodInfo.label}
            </span>
          </span>
          <span className="oe-clock__period-timerange">
            <i className="fi fi-rr-clock-three" aria-hidden="true" />
            {periodInfo.timeRange}
          </span>
        </div>

        {periodInfo.remainingMinutes > 0 && (
          <div className="oe-clock__period-progress-wrap">
            <div className="oe-clock__period-status-text">
              <span>남은 시간: {periodInfo.remainingMinutes}분</span>
              <span>{Math.round(periodInfo.progressPercent)}%</span>
            </div>
            <div className="oe-clock__period-progress-bar">
              <div
                className="oe-clock__period-progress-fill"
                style={{ width: `${periodInfo.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="oe-clock__body">
        {/* Analog Clock */}
        {(mode === "both" || mode === "analog") && (
          <div className="oe-clock__analog-wrap" aria-hidden="true">
            <svg
              className="oe-clock__analog-svg"
              viewBox="0 0 200 200"
              role="img"
              aria-label="아날로그 시계"
            >
              {/* Dial Background */}
              <circle cx="100" cy="100" r="94" className="oe-clock__dial-bg" />
              <circle cx="100" cy="100" r="90" className="oe-clock__dial-rim" />

              {/* Hour & Minute Ticks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const isMajor = i % 5 === 0;
                const angle = i * 6;
                const rad = ((angle - 90) * Math.PI) / 180;
                const r1 = isMajor ? 76 : 82;
                const r2 = 86;
                const x1 = 100 + r1 * Math.cos(rad);
                const y1 = 100 + r1 * Math.sin(rad);
                const x2 = 100 + r2 * Math.cos(rad);
                const y2 = 100 + r2 * Math.sin(rad);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={
                      isMajor ? "oe-clock__tick-major" : "oe-clock__tick-minor"
                    }
                  />
                );
              })}

              {/* Hour Numbers 1 to 12 */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
                const angle = (num % 12) * 30;
                const rad = ((angle - 90) * Math.PI) / 180;
                const r = 64;
                const x = 100 + r * Math.cos(rad);
                const y = 100 + r * Math.sin(rad) + 5; // vertical centering offset

                return (
                  <text
                    key={num}
                    x={x}
                    y={y}
                    className="oe-clock__hour-number"
                    textAnchor="middle"
                  >
                    {num}
                  </text>
                );
              })}

              {/* Clock Hands */}
              {/* Hour hand */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="52"
                className="oe-clock__hand oe-clock__hand--hour"
                transform={`rotate(${hourDeg} 100 100)`}
              />

              {/* Minute hand */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="34"
                className="oe-clock__hand oe-clock__hand--minute"
                transform={`rotate(${minuteDeg} 100 100)`}
              />

              {/* Second hand */}
              <line
                x1="100"
                y1="115"
                x2="100"
                y2="25"
                className="oe-clock__hand oe-clock__hand--second"
                transform={`rotate(${secondDeg} 100 100)`}
              />

              {/* Center Pin */}
              <circle cx="100" cy="100" r="4.5" className="oe-clock__center-pin" />
              <circle
                cx="100"
                cy="100"
                r="2"
                className="oe-clock__center-pin-core"
              />
            </svg>
          </div>
        )}

        {/* Digital Clock */}
        {(mode === "both" || mode === "digital") && (
          <div className="oe-clock__digital-wrap">
            <div className="oe-clock__date-text">
              <i className="fi fi-rr-calendar" aria-hidden="true" />
              <span>{dateString}</span>
            </div>

            <div className="oe-clock__digital-display" aria-live="polite">
              {!is24Hour && (
                <span className="oe-clock__ampm-tag">{ampm}</span>
              )}
              <span className="oe-clock__time-numbers">
                <span className="oe-clock__digits">{displayHours}</span>
                <span className="oe-clock__colon">:</span>
                <span className="oe-clock__digits">{displayMinutes}</span>
                {showSeconds && (
                  <>
                    <span className="oe-clock__colon">:</span>
                    <span className="oe-clock__digits oe-clock__digits--seconds">
                      {displaySeconds}
                    </span>
                  </>
                )}
              </span>
            </div>

            {/* Controls / Toggles */}
            <div className="oe-clock__controls">
              <button
                type="button"
                className={`oe-clock__toggle-btn ${is24Hour ? "oe-clock__toggle-btn--active" : ""}`}
                onClick={() => setIs24Hour((prev) => !prev)}
                aria-pressed={is24Hour}
                aria-label={is24Hour ? "12시간제로 변경" : "24시간제로 변경"}
              >
                <i className="fi fi-rr-time-twenty-four" aria-hidden="true" />
                <span>{is24Hour ? "24시간제" : "12시간제"}</span>
              </button>

              <button
                type="button"
                className={`oe-clock__toggle-btn ${showSeconds ? "oe-clock__toggle-btn--active" : ""}`}
                onClick={() => setShowSeconds((prev) => !prev)}
                aria-pressed={showSeconds}
                aria-label={showSeconds ? "초 단위 숨기기" : "초 단위 표시"}
              >
                <i className="fi fi-rr-stopwatch" aria-hidden="true" />
                <span>{showSeconds ? "초 표시" : "초 숨김"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
