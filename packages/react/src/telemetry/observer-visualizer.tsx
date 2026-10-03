import React from "react";
import type { EduStudentState, EduTelemetryEvent } from "./types.ts";

export const EDU_STATE_INFO: Record<
  EduStudentState,
  { label: string; description: string; className: string }
> = {
  focus: {
    label: "몰입 / 온태스크",
    description: "정상 속도로 문항 독해 및 상호작용 진행 중",
    className: "oe-telemetry-state--focus",
  },
  struggle: {
    label: "고민 / 스캐폴딩 필요",
    description: "문항 정체 또는 힌트 탐색 중 (교사 조력 권장)",
    className: "oe-telemetry-state--struggle",
  },
  idle: {
    label: "유휴 / 이탈",
    description: "입력 없이 3분 이상 창 비활성 상태",
    className: "oe-telemetry-state--idle",
  },
  mastery: {
    label: "성취 / 개념 숙달",
    description: "높은 정확도와 안정된 소요 시간으로 문제 해결 완료",
    className: "oe-telemetry-state--mastery",
  },
  overload: {
    label: "과부하 / 다중 재시도",
    description: "연속 오답 또는 급격한 무작위 클릭 감지",
    className: "oe-telemetry-state--overload",
  },
  explore: {
    label: "탐색 / 교구 조작",
    description: "가상 교구(분수막대, 수모형 등)를 능동적으로 조작 중",
    className: "oe-telemetry-state--explore",
  },
};

export interface StudentStateDotProps {
  state: EduStudentState;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StudentStateDot({
  state,
  pulse = true,
  size = "md",
  className = "",
}: StudentStateDotProps) {
  const info = EDU_STATE_INFO[state] || EDU_STATE_INFO.focus;
  return (
    <span
      className={[
        "oe-state-dot",
        info.className,
        `oe-state-dot--${size}`,
        pulse ? "oe-state-dot--pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${info.label}: ${info.description}`}
      aria-label={info.label}
    />
  );
}

export interface BehaviorObservationBadgeProps {
  state: EduStudentState;
  showDescription?: boolean;
  className?: string;
}

export function BehaviorObservationBadge({
  state,
  showDescription = false,
  className = "",
}: BehaviorObservationBadgeProps) {
  const info = EDU_STATE_INFO[state] || EDU_STATE_INFO.focus;
  return (
    <div
      className={["oe-observation-badge", info.className, className]
        .filter(Boolean)
        .join(" ")}
      data-testid="behavior-observation-badge"
      data-state={state}
    >
      <span className="oe-observation-badge__dot" />
      <span className="oe-observation-badge__label">{info.label}</span>
      {showDescription && (
        <span className="oe-observation-badge__desc">{info.description}</span>
      )}
    </div>
  );
}

export interface ObserverHeatmapStripProps {
  distribution: Partial<Record<EduStudentState, number>>;
  totalStudents?: number;
  className?: string;
}

export function ObserverHeatmapStrip({
  distribution,
  totalStudents,
  className = "",
}: ObserverHeatmapStripProps) {
  const total =
    totalStudents ||
    Object.values(distribution).reduce((sum, n) => (sum || 0) + (n || 0), 0) ||
    1;

  const states: EduStudentState[] = [
    "focus",
    "explore",
    "struggle",
    "overload",
    "mastery",
    "idle",
  ];

  return (
    <div className={["oe-heatmap-strip-container", className].filter(Boolean).join(" ")}>
      <div className="oe-heatmap-strip" role="progressbar" aria-label="학습자 행동 분포">
        {states.map((st) => {
          const count = distribution[st] || 0;
          if (count <= 0) return null;
          const pct = Math.round((count / total) * 100);
          return (
            <div
              key={st}
              className={`oe-heatmap-segment oe-telemetry-state--${st}`}
              style={{ width: `${pct}%` }}
              title={`${EDU_STATE_INFO[st].label}: ${count}명 (${pct}%)`}
            />
          );
        })}
      </div>
      <div className="oe-heatmap-legend">
        {states.map((st) => {
          const count = distribution[st] || 0;
          return (
            <div key={st} className="oe-heatmap-legend-item">
              <span className={`oe-state-dot oe-telemetry-state--${st}`} />
              <span className="oe-heatmap-legend-name">{EDU_STATE_INFO[st].label}</span>
              <span className="oe-heatmap-legend-count">{count}명</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface TelemetryEventLogTableProps {
  events: EduTelemetryEvent[];
  maxRows?: number;
  className?: string;
}

export function TelemetryEventLogTable({
  events,
  maxRows = 10,
  className = "",
}: TelemetryEventLogTableProps) {
  const displayEvents = events.slice(0, maxRows);

  return (
    <div className={["oe-telemetry-log-table-wrapper", className].filter(Boolean).join(" ")}>
      <table className="oe-telemetry-log-table">
        <thead>
          <tr>
            <th>시간</th>
            <th>익명 ID (Zero PII)</th>
            <th>컴포넌트</th>
            <th>행동</th>
            <th>소요(ms)</th>
            <th>망설임(ms)</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {displayEvents.length === 0 ? (
            <tr>
              <td colSpan={7} className="oe-telemetry-log-empty">
                수집된 무기명 이벤트가 없습니다.
              </td>
            </tr>
          ) : (
            displayEvents.map((evt, idx) => (
              <tr key={`${evt.timestamp}-${idx}`}>
                <td>{new Date(evt.timestamp).toLocaleTimeString("ko-KR")}</td>
                <td>
                  <code className="oe-telemetry-anon-code">{evt.anonId}</code>
                </td>
                <td>{evt.component}</td>
                <td>
                  <span className="oe-telemetry-action-badge">{evt.action}</span>
                </td>
                <td>{evt.dwellMs ? `${evt.dwellMs.toLocaleString()}ms` : "-"}</td>
                <td>{evt.hesitationMs ? `${evt.hesitationMs.toLocaleString()}ms` : "-"}</td>
                <td>
                  {evt.state ? (
                    <BehaviorObservationBadge state={evt.state} />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
