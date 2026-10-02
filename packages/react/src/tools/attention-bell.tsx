import { useState, useRef, useEffect, type CSSProperties } from "react";

export type BellPreset = "chime" | "xylophone" | "dingdong";

export interface AttentionBellProps {
  /** Default tone preset (default: "chime") */
  defaultPreset?: BellPreset;
  /** Default volume from 0 to 1 (default: 0.8) */
  defaultVolume?: number;
  /** Callback fired when bell is triggered */
  onRing?: (preset: BellPreset) => void;
  className?: string;
  style?: CSSProperties;
}

export function playSynthesizedBell(preset: BellPreset, volume: number = 0.8) {
  if (typeof window === "undefined") return;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    if (preset === "chime") {
      // "Do - Mi - Sol - Do" pure glockenspiel chime (C5, E5, G5, C6)
      const notes = [
        { f: 523.25, time: 0, dur: 0.8 },
        { f: 659.25, time: 0.16, dur: 0.8 },
        { f: 783.99, time: 0.32, dur: 0.8 },
        { f: 1046.5, time: 0.48, dur: 1.4 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(n.f, now + n.time);

        noteGain.gain.setValueAtTime(0.001, now + n.time);
        noteGain.gain.linearRampToValueAtTime(0.35, now + n.time + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } else if (preset === "xylophone") {
      // Crisp xylophone bounce: Sol - Si - Re - Sol (G5, B5, D6, G6)
      const notes = [
        { f: 783.99, time: 0, dur: 0.22 },
        { f: 987.77, time: 0.1, dur: 0.22 },
        { f: 1174.66, time: 0.2, dur: 0.22 },
        { f: 1567.98, time: 0.3, dur: 0.4 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, now + n.time);

        overtone.type = "sine";
        overtone.frequency.setValueAtTime(n.f * 2, now + n.time);

        noteGain.gain.setValueAtTime(0.001, now + n.time);
        noteGain.gain.linearRampToValueAtTime(0.4, now + n.time + 0.008);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

        osc.connect(noteGain);
        overtone.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + n.time);
        overtone.start(now + n.time);
        osc.stop(now + n.time + n.dur);
        overtone.stop(now + n.time + n.dur);
      });
    } else if (preset === "dingdong") {
      // School two-tone bell: High (F5: 698.46) -> Low (C5: 523.25)
      const notes = [
        { f: 698.46, time: 0, dur: 0.9 },
        { f: 523.25, time: 0.6, dur: 1.6 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(n.f, now + n.time);

        noteGain.gain.setValueAtTime(0.001, now + n.time);
        noteGain.gain.linearRampToValueAtTime(0.45, now + n.time + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    }
  } catch {
    // Audio autoplay restrictions safe catch
  }
}

export function AttentionBell({
  defaultPreset = "chime",
  defaultVolume = 0.8,
  onRing,
  className = "",
  style,
}: AttentionBellProps) {
  const [preset, setPreset] = useState<BellPreset>(defaultPreset);
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [rippleCount, setRippleCount] = useState<number>(0);
  const ringTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
    };
  }, []);

  const handleRing = () => {
    setIsRinging(true);
    setRippleCount((c) => c + 1);

    playSynthesizedBell(preset, volume);
    onRing?.(preset);

    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
    }
    ringTimeoutRef.current = window.setTimeout(() => {
      setIsRinging(false);
    }, 1200);
  };

  return (
    <div
      className={`oe-attention-bell ${className}`}
      style={style}
      data-testid="attention-bell"
      data-preset={preset}
    >
      <div className="oe-bell__header">
        <div className="oe-bell__title-group">
          <i className="fi fi-rr-bell" aria-hidden="true" />
          <h2 className="oe-bell__title">수업 집중 알림 차임벨</h2>
        </div>
      </div>

      {/* Main Bell Button Area */}
      <div className="oe-bell__stage">
        <div className="oe-bell__ring-wrap">
          {/* Concentric Ripples when active */}
          {isRinging && (
            <>
              <div key={`r1-${rippleCount}`} className="oe-bell__ripple oe-bell__ripple--1" />
              <div key={`r2-${rippleCount}`} className="oe-bell__ripple oe-bell__ripple--2" />
              <div key={`r3-${rippleCount}`} className="oe-bell__ripple oe-bell__ripple--3" />
            </>
          )}

          <button
            type="button"
            className={`oe-bell__action-btn ${isRinging ? "oe-bell__action-btn--ringing" : ""}`}
            onClick={handleRing}
            aria-label="집중 알림 차임벨 울리기"
            data-testid="bell-trigger"
          >
            <i className="fi fi-rr-bell oe-bell__icon" aria-hidden="true" />
            <span className="oe-bell__btn-label">차임벨 울리기</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Tabs */}
      <div className="oe-bell__presets-group" role="radiogroup" aria-label="음색 선택">
        <button
          type="button"
          className={`oe-bell__preset-btn ${preset === "chime" ? "oe-bell__preset-btn--active" : ""}`}
          onClick={() => setPreset("chime")}
          role="radio"
          aria-checked={preset === "chime"}
        >
          <i className="fi fi-rr-music" aria-hidden="true" />
          <span>차임벨 (도미솔도)</span>
        </button>

        <button
          type="button"
          className={`oe-bell__preset-btn ${preset === "xylophone" ? "oe-bell__preset-btn--active" : ""}`}
          onClick={() => setPreset("xylophone")}
          role="radio"
          aria-checked={preset === "xylophone"}
        >
          <i className="fi fi-rr-sparkles" aria-hidden="true" />
          <span>실로폰</span>
        </button>

        <button
          type="button"
          className={`oe-bell__preset-btn ${preset === "dingdong" ? "oe-bell__preset-btn--active" : ""}`}
          onClick={() => setPreset("dingdong")}
          role="radio"
          aria-checked={preset === "dingdong"}
        >
          <i className="fi fi-rr-volume" aria-hidden="true" />
          <span>학교 딩동</span>
        </button>
      </div>

      {/* Volume Slider Section */}
      <div className="oe-bell__volume-section">
        <div className="oe-bell__volume-label">
          <i className="fi fi-rr-volume" aria-hidden="true" />
          <span>볼륨</span>
          <span className="oe-bell__volume-value">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          className="oe-bell__slider"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          aria-label="차임벨 볼륨 조절"
        />
      </div>
    </div>
  );
}
