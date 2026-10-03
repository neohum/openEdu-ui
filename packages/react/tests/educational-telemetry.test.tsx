import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import {
  BehaviorObservationBadge,
  EduTelemetryProvider,
  ObserverHeatmapStrip,
  StudentStateDot,
  TelemetryEventLogTable,
  generateAnonymousStudentId,
  useEduTelemetry,
  type EduTelemetryEvent,
} from "../src/telemetry/index.ts";
import {
  EDUCATIONAL_COLORS,
  BEHAVIORAL_OBSERVATION_STATES,
} from "../../tokens/src/educational-colors.ts";

describe("Educational Colors & Behavioral Observation States", () => {
  it("defines foundational educational colors grounded in learning sciences", () => {
    expect(EDUCATIONAL_COLORS.focus!.id).toBe("edu-focus");
    expect(EDUCATIONAL_COLORS.focus!.light.base).toBe("#1d4ed8");
    expect(EDUCATIONAL_COLORS.focus!.light.contrastOnBg).toBeGreaterThanOrEqual(7.0);

    expect(EDUCATIONAL_COLORS.scaffold!.id).toBe("edu-scaffold");
    expect(EDUCATIONAL_COLORS.scaffold!.light.contrastOnBg).toBeGreaterThanOrEqual(4.5);

    expect(EDUCATIONAL_COLORS.mastery!.id).toBe("edu-mastery");
    expect(EDUCATIONAL_COLORS.feedback!.id).toBe("edu-feedback");
    expect(EDUCATIONAL_COLORS.explore!.id).toBe("edu-explore");
    expect(EDUCATIONAL_COLORS.calm!.id).toBe("edu-calm");
    expect(EDUCATIONAL_COLORS.idle!.id).toBe("edu-idle");
  });

  it("defines behavioral observation states for educator heatmaps", () => {
    expect(BEHAVIORAL_OBSERVATION_STATES.focus.label).toContain("몰입");
    expect(BEHAVIORAL_OBSERVATION_STATES.struggle.label).toContain("스캐폴딩");
    expect(BEHAVIORAL_OBSERVATION_STATES.idle.label).toContain("유휴");
    expect(BEHAVIORAL_OBSERVATION_STATES.mastery.label).toContain("숙달");
    expect(BEHAVIORAL_OBSERVATION_STATES.overload.label).toContain("과부하");
    expect(BEHAVIORAL_OBSERVATION_STATES.explore.label).toContain("탐색");
  });
});

describe("Anonymous Behavioral Telemetry System", () => {
  it("generates privacy-preserving zero-PII anonymous student IDs", () => {
    const id1 = generateAnonymousStudentId();
    const id2 = generateAnonymousStudentId();
    expect(id1).toMatch(/^anon_s_[a-f0-9]+$/);
    expect(id2).toMatch(/^anon_s_[a-f0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  function TestTrackingComponent({ onTrack }: { onTrack?: (record: any) => void }) {
    const { anonId, telemetryProps, recordAction } = useEduTelemetry({
      component: "MathFractionItem",
      targetId: "prob-04",
      autoDwellTracking: true,
      struggleDwellThresholdMs: 5000,
    });

    React.useEffect(() => {
      onTrack?.({ recordAction });
    }, [onTrack, recordAction]);

    return (
      <div {...telemetryProps} data-testid="tracking-component">
        <span data-testid="anon-display">{anonId}</span>
        <button
          type="button"
          onClick={() => recordAction("click", "focus")}
          data-testid="track-btn"
        >
          선택지 클릭
        </button>
      </div>
    );
  }

  it("dispatches anonymous behavioral events and updates context", async () => {
    const eventHandler = vi.fn();

    render(
      <EduTelemetryProvider anonId="anon_s_test123" onEvent={eventHandler}>
        <TestTrackingComponent />
      </EduTelemetryProvider>
    );

    const comp = screen.getByTestId("tracking-component");
    expect(comp).toHaveAttribute("data-edu-telemetry", "MathFractionItem");
    expect(comp).toHaveAttribute("data-edu-target-id", "prob-04");
    expect(comp).toHaveAttribute("data-edu-anon-id", "anon_s_test123");

    // Click triggers action record
    const btn = screen.getByTestId("track-btn");
    await userEvent.click(btn);

    expect(eventHandler).toHaveBeenCalled();
    const calls = eventHandler.mock.calls;
    const lastCall = calls[calls.length - 1]![0] as EduTelemetryEvent;
    expect(lastCall.anonId).toBe("anon_s_test123");
    expect(lastCall.component).toBe("MathFractionItem");
    expect(lastCall.action).toBe("click");
    expect(lastCall.state).toBe("focus");
  });

  it("renders BehaviorObservationBadge and StudentStateDot with state classes", () => {
    render(
      <div>
        <BehaviorObservationBadge state="struggle" showDescription />
        <StudentStateDot state="explore" />
      </div>
    );

    const badge = screen.getByTestId("behavior-observation-badge");
    expect(badge).toHaveClass("oe-telemetry-state--struggle");
    expect(badge).toHaveTextContent("스캐폴딩");
  });

  it("renders ObserverHeatmapStrip with proportion calculation", () => {
    const distribution = {
      focus: 15,
      explore: 5,
      struggle: 4,
      overload: 1,
      mastery: 8,
      idle: 2,
    };

    render(<ObserverHeatmapStrip distribution={distribution} totalStudents={35} />);
    const strip = screen.getByRole("progressbar");
    expect(strip).toBeInTheDocument();
    expect(screen.getByText("몰입 / 온태스크")).toBeInTheDocument();
    expect(screen.getByText("15명")).toBeInTheDocument();
  });

  it("renders TelemetryEventLogTable with zero-PII event rows", () => {
    const sampleEvents: EduTelemetryEvent[] = [
      {
        anonId: "anon_s_9a8b",
        sessionId: "sess_1",
        component: "EquationSolver",
        action: "dwell",
        timestamp: Date.now(),
        dwellMs: 12500,
        hesitationMs: 2300,
        state: "focus",
      },
    ];

    render(<TelemetryEventLogTable events={sampleEvents} />);
    expect(screen.getByText("EquationSolver")).toBeInTheDocument();
    expect(screen.getByText("anon_s_9a8b")).toBeInTheDocument();
    expect(screen.getByText("12,500ms")).toBeInTheDocument();
  });
});
