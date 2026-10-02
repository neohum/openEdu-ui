import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";

export type TimerMode = "countdown" | "stopwatch";

export interface ClassroomTimerProps {
  /** Initial mode (default: "countdown") */
  defaultMode?: TimerMode;
  /** Default countdown duration in seconds (default: 180 = 3 minutes) */
  defaultDuration?: number;
  /** Whether sound is enabled on timer finish (default: true) */
  soundEnabled?: boolean;
  /** Callback fired when countdown reaches 0 */
  onFinish?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function playTimerChime() {
  if (typeof window === "undefined") return;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    // Pleasant chime melody: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
    const melody = [
      { f: 523.25, d: 0.15, pause: 0.05 },
      { f: 659.25, d: 0.15, pause: 0.05 },
      { f: 783.99, d: 0.15, pause: 0.05 },
      { f: 1046.5, d: 0.45, pause: 0.1 },
    ];

    let t = now;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d + note.pause;
    });
  } catch {
    // Ignore audio context autoplay limitations safely
  }
}

export function ClassroomTimer({
  defaultMode = "countdown",
  defaultDuration = 180,
  soundEnabled = true,
  onFinish,
  className = "",
  style,
}: ClassroomTimerProps) {
  const [mode, setMode] = useState<TimerMode>(defaultMode);
  const [totalDuration, setTotalDuration] = useState<number>(defaultDuration);
  const [timeLeft, setTimeLeft] = useState<number>(defaultMode === "countdown" ? defaultDuration : 0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Keep callback ref updated
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Mode change handler
  const handleModeChange = (newMode: TimerMode) => {
    if (newMode === mode) return;
    setIsRunning(false);
    setIsFinished(false);
    setMode(newMode);
    if (newMode === "countdown") {
      setTimeLeft(totalDuration);
    } else {
      setTimeLeft(0);
    }
  };

  // Main tick interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (mode === "countdown") {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            if (soundEnabled) {
              playTimerChime();
            }
            onFinishRef.current?.();
            return 0;
          }
          return prev - 1;
        } else {
          // stopwatch
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, soundEnabled]);

  // Quick preset selection
  const selectPreset = (seconds: number) => {
    setIsRunning(false);
    setIsFinished(false);
    setMode("countdown");
    setTotalDuration(seconds);
    setTimeLeft(seconds);
  };

  // Adjust time (+1m, +30s, -30s)
  const adjustTime = (deltaSeconds: number) => {
    setIsFinished(false);
    if (mode === "countdown") {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev + deltaSeconds);
        // Also update totalDuration if next exceeds it
        if (next > totalDuration) {
          setTotalDuration(next);
        }
        return next;
      });
    } else {
      setTimeLeft((prev) => Math.max(0, prev + deltaSeconds));
    }
  };

  // Reset to initial
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    if (mode === "countdown") {
      setTimeLeft(totalDuration);
    } else {
      setTimeLeft(0);
    }
  }, [mode, totalDuration]);

  // Toggle start / pause
  const toggleStartPause = () => {
    if (isFinished) {
      resetTimer();
      setIsRunning(true);
      return;
    }
    if (mode === "countdown" && timeLeft === 0) {
      setTimeLeft(totalDuration > 0 ? totalDuration : 60);
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  };

  // Time calculations
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  // Percentage for progress ring (0 to 100)
  const progressRatio =
    mode === "countdown"
      ? totalDuration > 0
        ? Math.min(1, Math.max(0, timeLeft / totalDuration))
        : 0
      : 1;

  // SVG circle metrics
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const isLowTime = mode === "countdown" && timeLeft <= 10 && timeLeft > 0 && isRunning;

  return (
    <div
      className={`oe-classroom-timer ${isFinished ? "oe-classroom-timer--flash" : ""} ${className}`}
      style={style}
      data-testid="classroom-timer"
      data-mode={mode}
    >
      {/* Mode switcher tabs */}
      <div className="oe-timer__mode-tabs">
        <button
          type="button"
          className={`oe-timer__tab ${mode === "countdown" ? "oe-timer__tab--active" : ""}`}
          onClick={() => handleModeChange("countdown")}
          aria-label="카운트다운 타이머"
        >
          <i className="fi fi-rr-hourglass" aria-hidden="true" />
          <span>타이머</span>
        </button>
        <button
          type="button"
          className={`oe-timer__tab ${mode === "stopwatch" ? "oe-timer__tab--active" : ""}`}
          onClick={() => handleModeChange("stopwatch")}
          aria-label="스톱워치"
        >
          <i className="fi fi-rr-stopwatch" aria-hidden="true" />
          <span>스톱워치</span>
        </button>
      </div>

      {/* Finished Banner Alert */}
      {isFinished && (
        <div className="oe-timer__finish-banner" role="alert">
          <i className="fi fi-rr-alarm-clock" aria-hidden="true" />
          <span className="oe-timer__finish-text">시간이 종료되었습니다!</span>
          <button
            type="button"
            className="oe-timer__finish-dismiss"
            onClick={() => setIsFinished(false)}
            aria-label="알림 닫기"
          >
            <i className="fi fi-rr-cross-small" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Main Clock Dial Area */}
      <div className="oe-timer__dial-container">
        <svg
          className="oe-timer__dial-svg"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          {/* Background Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="oe-timer__ring-bg"
          />
          {/* Animated Progress Ring (only in countdown mode) */}
          {mode === "countdown" && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={`oe-timer__ring-progress ${isLowTime ? "oe-timer__ring-progress--low" : ""}`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 100 100)"
            />
          )}
        </svg>

        {/* Big Digital Display */}
        <div className="oe-timer__time-display" aria-live="polite">
          <span className={`oe-timer__digits ${isLowTime ? "oe-timer__digits--pulse" : ""}`}>
            {formattedMinutes}
          </span>
          <span className="oe-timer__colon">:</span>
          <span className={`oe-timer__digits ${isLowTime ? "oe-timer__digits--pulse" : ""}`}>
            {formattedSeconds}
          </span>
        </div>
      </div>

      {/* Quick Presets (Only in Countdown mode) */}
      {mode === "countdown" && (
        <div className="oe-timer__presets" aria-label="빠른 시간 설정">
          <button
            type="button"
            className={`oe-timer__preset-btn ${totalDuration === 60 ? "oe-timer__preset-btn--selected" : ""}`}
            onClick={() => selectPreset(60)}
          >
            1분
          </button>
          <button
            type="button"
            className={`oe-timer__preset-btn ${totalDuration === 180 ? "oe-timer__preset-btn--selected" : ""}`}
            onClick={() => selectPreset(180)}
          >
            3분
          </button>
          <button
            type="button"
            className={`oe-timer__preset-btn ${totalDuration === 300 ? "oe-timer__preset-btn--selected" : ""}`}
            onClick={() => selectPreset(300)}
          >
            5분
          </button>
          <button
            type="button"
            className={`oe-timer__preset-btn ${totalDuration === 600 ? "oe-timer__preset-btn--selected" : ""}`}
            onClick={() => selectPreset(600)}
          >
            10분
          </button>
        </div>
      )}

      {/* Manual Fine-tuning Adjusters */}
      <div className="oe-timer__adjusters">
        <button
          type="button"
          className="oe-timer__adj-btn"
          onClick={() => adjustTime(60)}
          aria-label="1분 추가"
        >
          +1분
        </button>
        <button
          type="button"
          className="oe-timer__adj-btn"
          onClick={() => adjustTime(30)}
          aria-label="30초 추가"
        >
          +30초
        </button>
        <button
          type="button"
          className="oe-timer__adj-btn"
          onClick={() => adjustTime(-30)}
          aria-label="30초 차감"
          disabled={timeLeft <= 0}
        >
          -30초
        </button>
        <button
          type="button"
          className="oe-timer__adj-btn"
          onClick={resetTimer}
          aria-label="초기화"
        >
          <i className="fi fi-rr-refresh" aria-hidden="true" />
          <span>리셋</span>
        </button>
      </div>

      {/* Primary Action Controls */}
      <div className="oe-timer__actions">
        <button
          type="button"
          className={`oe-timer__btn-primary ${isRunning ? "oe-timer__btn-primary--running" : ""}`}
          onClick={toggleStartPause}
          aria-label={isRunning ? "일시정지" : "시작"}
        >
          <i
            className={`fi ${isRunning ? "fi-rr-pause" : "fi-rr-play"}`}
            aria-hidden="true"
          />
          <span>{isRunning ? "일시정지" : "시작"}</span>
        </button>

        <button
          type="button"
          className="oe-timer__btn-secondary"
          onClick={resetTimer}
          aria-label="완전 초기화"
        >
          <i className="fi fi-rr-rotate-left" aria-hidden="true" />
          <span>초기화</span>
        </button>
      </div>
    </div>
  );
}
