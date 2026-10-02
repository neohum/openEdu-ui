import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ClassroomClock,
  ClassroomTimer,
  RandomPicker,
  AttentionBell,
  GroupScoreBoard,
  getPeriodStatus,
  playTimerChime,
  playCelebrationSound,
  playSynthesizedBell,
} from "../src/tools/index.ts";

// Setup AudioContext mock for JSDOM
beforeAll(() => {
  class MockGain {
    gain = {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
    connect = vi.fn();
  }

  class MockOscillator {
    type = "sine";
    frequency = {
      setValueAtTime: vi.fn(),
    };
    connect = vi.fn();
    start = vi.fn();
    stop = vi.fn();
  }

  class MockAudioContext {
    currentTime = 0;
    destination = {};
    createOscillator = vi.fn(() => new MockOscillator());
    createGain = vi.fn(() => new MockGain());
  }

  vi.stubGlobal("AudioContext", MockAudioContext);
});

describe("ClassroomClock", () => {
  it("renders analog dial and digital time elements", () => {
    const fixedTime = new Date("2026-10-02T09:15:00");
    render(<ClassroomClock initialTime={fixedTime} />);

    expect(screen.getByTestId("classroom-clock")).toBeInTheDocument();
    expect(screen.getByText("09")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("calculates correct period status for 09:15 as 1교시", () => {
    const fixedTime = new Date("2026-10-02T09:15:00");
    const status = getPeriodStatus(fixedTime);

    expect(status.status).toBe("class");
    expect(status.label).toBe("1교시");
    expect(status.remainingMinutes).toBe(25); // 09:40 - 09:15 = 25m
  });

  it("toggles 12/24 hour format when button clicked", async () => {
    const fixedTime = new Date("2026-10-02T14:30:00");
    render(<ClassroomClock initialTime={fixedTime} defaultIs24Hour={false} />);

    // Initially 12-hour: 02:30 (with 오후)
    expect(screen.getByText("오후")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();

    const toggleBtn = screen.getByRole("button", { name: /24시간제로 변경/i });
    fireEvent.click(toggleBtn);

    // After toggle: 14:30
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("toggles seconds display on/off", () => {
    const fixedTime = new Date("2026-10-02T09:15:45");
    render(<ClassroomClock initialTime={fixedTime} defaultShowSeconds={true} />);

    expect(screen.getByText("45")).toBeInTheDocument();

    const toggleSecBtn = screen.getByRole("button", { name: /초 단위 숨기기/i });
    fireEvent.click(toggleSecBtn);

    expect(screen.queryByText("45")).not.toBeInTheDocument();
  });
});

describe("ClassroomTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with default countdown 3 minutes (03:00)", () => {
    render(<ClassroomTimer defaultDuration={180} />);

    expect(screen.getByTestId("classroom-timer")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
  });

  it("allows switching to presets (e.g. 5 minutes)", () => {
    render(<ClassroomTimer defaultDuration={180} />);

    const preset5m = screen.getByRole("button", { name: "5분" });
    fireEvent.click(preset5m);

    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
  });

  it("adjusts time with +1분 and -30초 buttons", () => {
    render(<ClassroomTimer defaultDuration={60} />);

    // +1 min (120s = 02:00)
    const plus1m = screen.getByRole("button", { name: "1분 추가" });
    fireEvent.click(plus1m);
    expect(screen.getByText("02")).toBeInTheDocument();

    // -30s (90s = 01:30)
    const minus30s = screen.getByRole("button", { name: "30초 차감" });
    fireEvent.click(minus30s);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("starts, decrements time, and triggers onFinish callback when reaches 0", () => {
    const onFinish = vi.fn();
    render(<ClassroomTimer defaultDuration={3} onFinish={onFinish} />);

    const startBtn = screen.getByRole("button", { name: "시작" });
    fireEvent.click(startBtn);

    // Fast-forward 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("02")).toBeInTheDocument();

    // Fast-forward 2 more seconds to finish
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getAllByText("00").length).toBeGreaterThanOrEqual(1);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent("시간이 종료되었습니다!");
  });

  it("switches to stopwatch mode and counts upwards", () => {
    render(<ClassroomTimer defaultMode="stopwatch" />);

    expect(screen.getAllByText("00").length).toBeGreaterThanOrEqual(1);
    const startBtn = screen.getByRole("button", { name: "시작" });
    fireEvent.click(startBtn);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("05")).toBeInTheDocument();
  });
});

describe("RandomPicker", () => {
  it("renders with default items and allows preset switching", () => {
    render(<RandomPicker />);

    expect(screen.getByTestId("random-picker")).toBeInTheDocument();
    expect(screen.getAllByText(/30명/).length).toBeGreaterThanOrEqual(1);

    const groupsPreset = screen.getByRole("button", { name: "1~6모둠" });
    fireEvent.click(groupsPreset);

    expect(screen.getAllByText(/6명/).length).toBeGreaterThanOrEqual(1);
  });

  it("picks a candidate instantly when animationDuration is 0", () => {
    const onPick = vi.fn();
    render(
      <RandomPicker
        initialItems={["김철수", "이영희", "박민수"]}
        animationDuration={0}
        onPick={onPick}
      />
    );

    const pickBtn = screen.getByRole("button", { name: "추첨 시작" });
    fireEvent.click(pickBtn);

    const winnerDisplay = screen.getByTestId("winner-display");
    expect(winnerDisplay).toBeInTheDocument();
    expect(["김철수", "이영희", "박민수"]).toContain(winnerDisplay.textContent);
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it("handles duplicate exclusion correctly", () => {
    render(
      <RandomPicker
        initialItems={["학생A", "학생B"]}
        animationDuration={0}
      />
    );

    const pickBtn = screen.getByRole("button", { name: "추첨 시작" });

    // Pick 1
    fireEvent.click(pickBtn);
    expect(screen.getByTestId("random-picker")).toHaveTextContent("추첨 가능: 1명");

    // Confirm modal
    const confirmBtn = screen.getByRole("button", { name: "확인" });
    fireEvent.click(confirmBtn);

    // Pick 2
    fireEvent.click(pickBtn);
    expect(screen.getByTestId("random-picker")).toHaveTextContent("추첨 가능: 0명");
  });
});

describe("AttentionBell", () => {
  it("renders bell trigger button and preset tabs", () => {
    render(<AttentionBell />);

    expect(screen.getByTestId("attention-bell")).toBeInTheDocument();
    expect(screen.getByTestId("bell-trigger")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /차임벨/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /실로폰/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /학교 딩동/i })).toBeInTheDocument();
  });

  it("triggers onRing callback when bell button is clicked", () => {
    const onRing = vi.fn();
    render(<AttentionBell onRing={onRing} defaultPreset="chime" />);

    const bellBtn = screen.getByTestId("bell-trigger");
    fireEvent.click(bellBtn);

    expect(onRing).toHaveBeenCalledWith("chime");
  });

  it("switches preset to xylophone and dingdong", () => {
    const onRing = vi.fn();
    render(<AttentionBell onRing={onRing} />);

    const xyloBtn = screen.getByRole("radio", { name: /실로폰/i });
    fireEvent.click(xyloBtn);

    const bellBtn = screen.getByTestId("bell-trigger");
    fireEvent.click(bellBtn);

    expect(onRing).toHaveBeenCalledWith("xylophone");
  });

  it("allows adjusting the volume slider", () => {
    render(<AttentionBell defaultVolume={0.5} />);

    expect(screen.getByText("50%")).toBeInTheDocument();

    const slider = screen.getByRole("slider", { name: "차임벨 볼륨 조절" });
    fireEvent.change(slider, { target: { value: "0.8" } });

    expect(screen.getByText("80%")).toBeInTheDocument();
  });
});

describe("GroupScoreBoard", () => {
  it("renders initial 4 groups with 0 scores", () => {
    render(<GroupScoreBoard />);

    expect(screen.getByTestId("group-scoreboard")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1모둠")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2모둠")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3모둠")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4모둠")).toBeInTheDocument();

    const scores = screen.getAllByTestId("group-score");
    expect(scores.length).toBe(4);
    scores.forEach((s) => expect(s.textContent).toBe("0"));
  });

  it("increments score (+1 and +5) and displays trophy for highest score", () => {
    render(<GroupScoreBoard />);

    // Initially no trophy because all scores are 0
    expect(screen.queryByTestId("trophy-badge")).not.toBeInTheDocument();

    // Increase 1모둠 score by +1
    const plus1Btn = screen.getByRole("button", { name: "1모둠 +1점" });
    fireEvent.click(plus1Btn);

    // 1모둠 now has 1 point and is 1st place!
    expect(screen.getByTestId("trophy-badge")).toBeInTheDocument();

    // Increase 2모둠 by +5 points
    const plus5Btn = screen.getByRole("button", { name: "2모둠 +5점" });
    fireEvent.click(plus5Btn);

    // Now 2모둠 should have 5 points
    const card2 = screen.getByTestId("score-card-2모둠");
    expect(card2).toHaveTextContent("5");
    expect(card2).toContainElement(screen.getByTestId("trophy-badge"));
  });

  it("allows adding and removing groups within 1 to 8 range", () => {
    render(<GroupScoreBoard minGroups={1} maxGroups={6} />);

    const addBtn = screen.getByRole("button", { name: "모둠 추가" });

    // Add 5th group
    fireEvent.click(addBtn);
    expect(screen.getByDisplayValue("5모둠")).toBeInTheDocument();

    // Add 6th group
    fireEvent.click(addBtn);
    expect(screen.getByDisplayValue("6모둠")).toBeInTheDocument();

    // Reached max (6), add button should be disabled
    expect(addBtn).toBeDisabled();

    // Remove 6모둠
    const remove6Btn = screen.getByRole("button", { name: "6모둠 삭제" });
    fireEvent.click(remove6Btn);
    expect(screen.queryByDisplayValue("6모둠")).not.toBeInTheDocument();
  });

  it("resets all scores to 0 with global reset button", () => {
    render(<GroupScoreBoard />);

    const plus5Btn = screen.getByRole("button", { name: "1모둠 +5점" });
    fireEvent.click(plus5Btn);
    expect(screen.getByTestId("score-card-1모둠")).toHaveTextContent("5");

    const resetAllBtn = screen.getByRole("button", { name: "모든 점수 초기화" });
    fireEvent.click(resetAllBtn);

    const scores = screen.getAllByTestId("group-score");
    scores.forEach((s) => expect(s.textContent).toBe("0"));
    expect(screen.queryByTestId("trophy-badge")).not.toBeInTheDocument();
  });
});

describe("Audio Synthesis Functions", () => {
  it("executes sound functions without throwing in simulated environment", () => {
    expect(() => playTimerChime()).not.toThrow();
    expect(() => playCelebrationSound()).not.toThrow();
    expect(() => playSynthesizedBell("chime")).not.toThrow();
    expect(() => playSynthesizedBell("xylophone")).not.toThrow();
    expect(() => playSynthesizedBell("dingdong")).not.toThrow();
  });
});
