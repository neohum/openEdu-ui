import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { InkBoard, type InkBoardProps } from "../ink/ink-board.tsx";

export type BoardBackgroundPreset =
  | "plain"
  | "dots"
  | "grid-5mm"
  | "music-staff"
  | "english-4line"
  | "manuscript";

export interface BoardBackgroundPresetInfo {
  id: BoardBackgroundPreset;
  label: string;
  description: string;
}

export const BOARD_BACKGROUND_PRESETS: readonly BoardBackgroundPresetInfo[] = [
  { id: "plain", label: "무지 칠판", description: "기본 단색 칠판 배경" },
  { id: "dots", label: "도트 그리드", description: "간격 정렬용 점선 격자" },
  { id: "grid-5mm", label: "5mm 모눈", description: "수학 도형·좌표 판서용 정밀 모눈" },
  { id: "music-staff", label: "음악 오선지", description: "계이름·음표 판서용 5선 보표" },
  { id: "english-4line", label: "영어 4선지", description: "알파벳 필기체·기준선 판서용 4선" },
  { id: "manuscript", label: "원고지", description: "국어 맞춤법·글쓰기 지도용 원고지 격자" },
] as const;

export interface BoardCanvasProps {
  /** 현재 배경 프리셋 (제어 컴포넌트용) */
  preset?: BoardBackgroundPreset;
  /** 초기 배경 프리셋 (비제어 컴포넌트용, 기본값: "plain") */
  defaultPreset?: BoardBackgroundPreset;
  /** 배경 프리셋 변경 콜백 */
  onPresetChange?: (preset: BoardBackgroundPreset) => void;
  /** 상단 배경 전환 컨트롤 표시 여부 (기본값: true) */
  showPresetSelector?: boolean;
  /** 내장 InkBoard 판서 레이어 활성화 여부 (기본값: false) */
  enableInk?: boolean;
  /** 내장 InkBoard에 전달할 속성 */
  inkProps?: InkBoardProps;
  /** 캔버스 최소 높이 (기본값: 420) */
  minHeight?: number;
  /** 접근성 라벨 (기본값: "전자칠판 배경 캔버스") */
  label?: string;
  /** 캔버스 위에 렌더링할 자식 요소 */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function BoardCanvas({
  preset: controlledPreset,
  defaultPreset = "plain",
  onPresetChange,
  showPresetSelector = true,
  enableInk = false,
  inkProps,
  minHeight = 420,
  label = "전자칠판 배경 캔버스",
  children,
  className = "",
  style,
}: BoardCanvasProps) {
  const [internalPreset, setInternalPreset] = useState<BoardBackgroundPreset>(defaultPreset);
  const currentPreset = controlledPreset ?? internalPreset;
  const uid = useId().replace(/:/g, "");

  const handlePresetSelect = (next: BoardBackgroundPreset) => {
    if (controlledPreset === undefined) {
      setInternalPreset(next);
    }
    onPresetChange?.(next);
  };

  const renderPatternDefs = () => {
    const patternId = `oe-board-pattern-${uid}-${currentPreset}`;
    switch (currentPreset) {
      case "dots":
        return {
          patternId,
          defs: (
            <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.5" className="oe-board-canvas__pattern-dot" />
            </pattern>
          ),
        };
      case "grid-5mm":
        return {
          patternId,
          defs: (
            <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20 M 40 0 L 0 0 0 40 M 60 0 L 0 0 0 60 M 80 0 L 0 0 0 80"
                fill="none"
                className="oe-board-canvas__pattern-line-minor"
              />
              <g className="oe-board-canvas__pattern-line-minor">
                <line x1="20" y1="0" x2="20" y2="100" />
                <line x1="40" y1="0" x2="40" y2="100" />
                <line x1="60" y1="0" x2="60" y2="100" />
                <line x1="80" y1="0" x2="80" y2="100" />
                <line x1="0" y1="20" x2="100" y2="20" />
                <line x1="0" y1="40" x2="100" y2="40" />
                <line x1="0" y1="60" x2="100" y2="60" />
                <line x1="0" y1="80" x2="100" y2="80" />
              </g>
              <rect
                width="100"
                height="100"
                fill="none"
                className="oe-board-canvas__pattern-line-major"
              />
            </pattern>
          ),
        };
      case "music-staff":
        return {
          patternId,
          defs: (
            <pattern id={patternId} width="120" height="96" patternUnits="userSpaceOnUse">
              <line x1="0" y1="20" x2="120" y2="20" className="oe-board-canvas__pattern-line-major" />
              <line x1="0" y1="30" x2="120" y2="30" className="oe-board-canvas__pattern-line-major" />
              <line x1="0" y1="40" x2="120" y2="40" className="oe-board-canvas__pattern-line-major" />
              <line x1="0" y1="50" x2="120" y2="50" className="oe-board-canvas__pattern-line-major" />
              <line x1="0" y1="60" x2="120" y2="60" className="oe-board-canvas__pattern-line-major" />
            </pattern>
          ),
        };
      case "english-4line":
        return {
          patternId,
          defs: (
            <pattern id={patternId} width="120" height="88" patternUnits="userSpaceOnUse">
              <line x1="0" y1="18" x2="120" y2="18" className="oe-board-canvas__pattern-line-major" />
              <line
                x1="0"
                y1="34"
                x2="120"
                y2="34"
                strokeDasharray="4 4"
                className="oe-board-canvas__pattern-line-minor"
              />
              <line x1="0" y1="50" x2="120" y2="50" className="oe-board-canvas__pattern-line-accent" />
              <line x1="0" y1="66" x2="120" y2="66" className="oe-board-canvas__pattern-line-major" />
            </pattern>
          ),
        };
      case "manuscript":
        return {
          patternId,
          defs: (
            <pattern id={patternId} width="36" height="44" patternUnits="userSpaceOnUse">
              <rect
                x="0"
                y="4"
                width="36"
                height="36"
                fill="none"
                className="oe-board-canvas__pattern-line-accent"
              />
              <line
                x1="18"
                y1="4"
                x2="18"
                y2="40"
                strokeDasharray="2 2"
                className="oe-board-canvas__pattern-line-minor"
              />
              <line
                x1="0"
                y1="22"
                x2="36"
                y2="22"
                strokeDasharray="2 2"
                className="oe-board-canvas__pattern-line-minor"
              />
            </pattern>
          ),
        };
      case "plain":
      default:
        return null;
    }
  };

  const patternInfo = renderPatternDefs();
  const rootClass = ["oe-board-canvas", className].filter(Boolean).join(" ");

  return (
    <section
      className={rootClass}
      style={{
        "--oe-board-canvas-min-h": `${minHeight}px`,
        ...style,
      } as CSSProperties}
      aria-label={label}
      data-testid="board-canvas"
      data-preset={currentPreset}
    >
      {showPresetSelector ? (
        <div className="oe-board-canvas__toolbar" role="toolbar" aria-label="칠판 배경 선택">
          {BOARD_BACKGROUND_PRESETS.map((item) => {
            const active = item.id === currentPreset;
            return (
              <button
                key={item.id}
                type="button"
                className="oe-board-canvas__preset-btn"
                data-preset-id={item.id}
                data-active={active ? "true" : undefined}
                aria-pressed={active}
                title={item.description}
                onClick={() => handlePresetSelect(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="oe-board-canvas__stage">
        {patternInfo ? (
          <svg
            className="oe-board-canvas__bg-svg"
            aria-hidden="true"
            data-testid={`board-pattern-${currentPreset}`}
          >
            <defs>{patternInfo.defs}</defs>
            <rect width="100%" height="100%" fill={`url(#${patternInfo.patternId})`} />
          </svg>
        ) : null}

        <div className="oe-board-canvas__content">
          {enableInk ? <InkBoard {...inkProps} /> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
