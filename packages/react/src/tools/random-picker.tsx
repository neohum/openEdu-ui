import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";

export interface RandomPickerProps {
  /** Initial candidate items or names */
  initialItems?: string[];
  /** Duration of shuffle animation in milliseconds (default: 2000, set to 0 for instant in tests) */
  animationDuration?: number;
  /** Whether sound is enabled on pick (default: true) */
  soundEnabled?: boolean;
  /** Callback fired when winner is selected */
  onPick?: (winner: string) => void;
  className?: string;
  style?: CSSProperties;
}

export function playCelebrationSound() {
  if (typeof window === "undefined") return;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    // Cheerful arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const fanfare = [
      { f: 523.25, time: 0, dur: 0.12 },
      { f: 659.25, time: 0.1, dur: 0.12 },
      { f: 783.99, time: 0.2, dur: 0.12 },
      { f: 1046.5, time: 0.3, dur: 0.4 },
    ];

    fanfare.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.25, now + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch {
    // Audio autoplay restrictions safe catch
  }
}

export function generatePresetItems(preset: "1-30" | "1-25" | "groups-6"): string[] {
  if (preset === "1-30") {
    return Array.from({ length: 30 }, (_, i) => `${i + 1}번`);
  }
  if (preset === "1-25") {
    return Array.from({ length: 25 }, (_, i) => `${i + 1}번`);
  }
  return ["1모둠", "2모둠", "3모둠", "4모둠", "5모둠", "6모둠"];
}

export function RandomPicker({
  initialItems,
  animationDuration = 2000,
  soundEnabled = true,
  onPick,
  className = "",
  style,
}: RandomPickerProps) {
  const [inputText, setInputText] = useState<string>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.join("\n");
    }
    return generatePresetItems("1-30").join("\n");
  });

  const [excludePrevious, setExcludePrevious] = useState<boolean>(true);
  const [pickedHistory, setPickedHistory] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState<boolean>(false);
  const [displayCandidate, setDisplayCandidate] = useState<string>("추첨 준비 완료");
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState<boolean>(false);

  const timeoutRefs = useRef<number[]>([]);

  // Parse candidate list from raw text
  const candidates = useMemo(() => {
    return inputText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [inputText]);

  // Available candidate pool considering exclusion
  const availablePool = useMemo(() => {
    if (!excludePrevious) return candidates;
    const historySet = new Set(pickedHistory);
    return candidates.filter((item) => !historySet.has(item));
  }, [candidates, excludePrevious, pickedHistory]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handlePreset = (preset: "1-30" | "1-25" | "groups-6") => {
    const items = generatePresetItems(preset);
    setInputText(items.join("\n"));
    setPickedHistory([]);
    setWinner(null);
    setShowWinnerPopup(false);
    setDisplayCandidate("추첨 준비 완료");
  };

  const handleStartPick = () => {
    if (isPicking) return;
    if (availablePool.length === 0) {
      alert("추첨 가능한 대상이 없습니다! 당첨자 제외 옵션을 해제하거나 목록을 초기화하세요.");
      return;
    }

    setIsPicking(true);
    setWinner(null);
    setShowWinnerPopup(false);

    if (availablePool.length === 0) return;

    // If 0 duration (for tests or instant pick)
    if (animationDuration <= 0) {
      const chosen = availablePool[Math.floor(Math.random() * availablePool.length)] ?? availablePool[0] ?? "";
      setDisplayCandidate(chosen);
      setWinner(chosen);
      setIsPicking(false);
      setShowWinnerPopup(true);
      setPickedHistory((prev) => [...prev, chosen]);
      if (soundEnabled) playCelebrationSound();
      onPick?.(chosen);
      return;
    }

    // Dynamic roulette shuffle interval
    let elapsed = 0;
    const intervalStep = 60;
    const intervalId = setInterval(() => {
      elapsed += intervalStep;
      const randomIdx = Math.floor(Math.random() * availablePool.length);
      const tempCandidate = availablePool[randomIdx] ?? "";
      setDisplayCandidate(tempCandidate);

      if (elapsed >= animationDuration) {
        clearInterval(intervalId);
        const finalChosen = availablePool[Math.floor(Math.random() * availablePool.length)] ?? tempCandidate;
        setDisplayCandidate(finalChosen);
        setWinner(finalChosen);
        setIsPicking(false);
        setShowWinnerPopup(true);
        setPickedHistory((prev) => [...prev, finalChosen]);
        if (soundEnabled) playCelebrationSound();
        onPick?.(finalChosen);
      }
    }, intervalStep);
  };

  const resetHistory = () => {
    setPickedHistory([]);
    setWinner(null);
    setShowWinnerPopup(false);
    setDisplayCandidate("추첨 준비 완료");
  };

  return (
    <div
      className={`oe-random-picker ${className}`}
      style={style}
      data-testid="random-picker"
    >
      {/* Header */}
      <div className="oe-picker__header">
        <div className="oe-picker__title-group">
          <i className="fi fi-rr-shuffle" aria-hidden="true" />
          <h2 className="oe-picker__title">발표자 / 모둠 추첨기</h2>
        </div>
        <div className="oe-picker__counts">
          <span className="oe-picker__count-tag">
            전체: <strong>{candidates.length}명</strong>
          </span>
          <span className="oe-picker__count-tag">
            추첨 가능: <strong>{availablePool.length}명</strong>
          </span>
        </div>
      </div>

      {/* Main Roulette / Display Stage */}
      <div className="oe-picker__stage">
        <div
          className={`oe-picker__roulette-box ${isPicking ? "oe-picker__roulette-box--spinning" : ""}`}
        >
          <div className="oe-picker__roulette-inner">
            <span
              className={`oe-picker__candidate-name ${isPicking ? "oe-picker__candidate-name--blur" : ""}`}
              aria-live="assertive"
            >
              {displayCandidate}
            </span>
          </div>
        </div>

        {/* Big Pick Action Button */}
        <button
          type="button"
          className="oe-picker__btn-pick"
          onClick={handleStartPick}
          disabled={isPicking || availablePool.length === 0}
          aria-label="추첨 시작"
        >
          <i
            className={`fi ${isPicking ? "fi-rr-spinner oe-spin" : "fi-rr-play"}`}
            aria-hidden="true"
          />
          <span>{isPicking ? "추첨 중..." : "추첨 시작"}</span>
        </button>
      </div>

      {/* Winner Celebration Modal / Popup */}
      {showWinnerPopup && winner && (
        <div className="oe-picker__winner-popup" role="dialog" aria-modal="true">
          <div className="oe-picker__winner-card">
            <div className="oe-picker__winner-icon-wrap">
              <i className="fi fi-rr-trophy" aria-hidden="true" />
            </div>
            <div className="oe-picker__winner-heading">축하합니다!</div>
            <div className="oe-picker__winner-name" data-testid="winner-display">
              {winner}
            </div>
            <div className="oe-picker__winner-actions">
              <button
                type="button"
                className="oe-picker__btn-sub"
                onClick={handleStartPick}
                disabled={availablePool.length <= 1 && excludePrevious}
              >
                <i className="fi fi-rr-refresh" aria-hidden="true" />
                <span>다시 추첨</span>
              </button>
              <button
                type="button"
                className="oe-picker__btn-primary"
                onClick={() => setShowWinnerPopup(false)}
              >
                <i className="fi fi-rr-check" aria-hidden="true" />
                <span>확인</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options & Presets */}
      <div className="oe-picker__options-bar">
        <label className="oe-picker__checkbox-label">
          <input
            type="checkbox"
            className="oe-picker__checkbox"
            checked={excludePrevious}
            onChange={(e) => setExcludePrevious(e.target.checked)}
          />
          <span>당첨자 자동 제외 (중복 방지)</span>
        </label>

        <div className="oe-picker__presets">
          <button
            type="button"
            className="oe-picker__preset-btn"
            onClick={() => handlePreset("1-30")}
          >
            1~30번
          </button>
          <button
            type="button"
            className="oe-picker__preset-btn"
            onClick={() => handlePreset("1-25")}
          >
            1~25번
          </button>
          <button
            type="button"
            className="oe-picker__preset-btn"
            onClick={() => handlePreset("groups-6")}
          >
            1~6모둠
          </button>
        </div>
      </div>

      {/* History and Input Drawer */}
      <div className="oe-picker__drawer">
        {/* Exclusion History */}
        {pickedHistory.length > 0 && (
          <div className="oe-picker__history-section">
            <div className="oe-picker__history-header">
              <span className="oe-picker__history-title">
                <i className="fi fi-rr-time-past" aria-hidden="true" />
                이전 당첨 목록 ({pickedHistory.length}명)
              </span>
              <button
                type="button"
                className="oe-picker__history-reset-btn"
                onClick={resetHistory}
              >
                초기화
              </button>
            </div>
            <div className="oe-picker__history-tags">
              {pickedHistory.map((item, idx) => (
                <span key={idx} className="oe-picker__history-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Names Textarea */}
        <div className="oe-picker__input-section">
          <label htmlFor="oe-picker-input" className="oe-picker__input-label">
            <i className="fi fi-rr-edit" aria-hidden="true" />
            <span>명단 편집 (줄바꿈 또는 쉼표 구분)</span>
          </label>
          <textarea
            id="oe-picker-input"
            className="oe-picker__textarea"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="학생 이름 또는 모둠 목록을 입력하세요."
          />
        </div>
      </div>
    </div>
  );
}
