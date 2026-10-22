import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Skeleton } from "../primitives/skeleton.tsx";
import { Icon } from "../primitives/icon.tsx";
import "./color-figure.css";

export type ColorFigureSurface = "board" | "desktop" | "mobile";

export interface ColorFigureProps {
  /** 외부 HTML 또는 번들 URL */
  src?: string;
  /** 인라인 완성형 인터랙티브 HTML 문자열 (Colorfigures 단일 파일 번들 등) */
  srcDoc?: string;
  /** 교구 접근성 이름 및 제목 */
  title?: string;
  /** 컴포넌트 너비 (기본값: '100%') */
  width?: number | string;
  /** 컴포넌트 높이 (기본값: 500) */
  height?: number | string;
  /** 투시(내부 메커니즘 관찰) 모드 (제어 속성) */
  seeThrough?: boolean;
  /** 초기 투시 모드 (비제어 속성, 기본값: false) */
  defaultSeeThrough?: boolean;
  /** 부품 라벨 표시 여부 (제어 속성) */
  labels?: boolean;
  /** 초기 부품 라벨 표시 여부 (비제어 속성, 기본값: true) */
  defaultLabels?: boolean;
  /** 전자칠판('board'), 데스크톱('desktop'), 모바일('mobile') 뷰모드 (기본값: 'board') */
  surface?: ColorFigureSurface;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 추가 인라인 스타일 */
  style?: CSSProperties;
  /** 컬러피규어 내부 상호작용 또는 제어 발생 시 콜백 */
  onAction?: (actionName: string, state: any) => void;
  /** 추가 오버레이 또는 자식 요소 */
  children?: ReactNode;
}

/**
 * ColorFigure - openEdu 인터랙티브 3D/아이소메트릭 교구 뷰어 컴포넌트
 *
 * 교실 전자칠판(56px 대형 터치 타깃)과 학생 개인 기기(데스크톱/모바일) 환경 모두를 지원하며,
 * iframe sandbox 보안(`allow-scripts allow-same-origin`) 격리 및
 * 360도 회전, 내부 투시(See-Through), 부품 라벨(Labels), 확대/축소 양방향 제어를 제공합니다.
 */
export function ColorFigure({
  src,
  srcDoc,
  title = "3D 인터랙티브 입체 교구",
  width = "100%",
  height = 500,
  seeThrough: controlledSeeThrough,
  defaultSeeThrough = false,
  labels: controlledLabels,
  defaultLabels = true,
  surface = "board",
  className = "",
  style,
  onAction,
  children,
}: ColorFigureProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerId = useId();

  // 내부 상태 관리
  const [internalSeeThrough, setInternalSeeThrough] = useState<boolean>(defaultSeeThrough);
  const [internalLabels, setInternalLabels] = useState<boolean>(defaultLabels);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(src || srcDoc));
  const [hasError, setHasError] = useState<boolean>(!src && !srcDoc);

  // 제어/비제어 값 결정
  const isSeeThrough = controlledSeeThrough !== undefined ? controlledSeeThrough : internalSeeThrough;
  const isLabels = controlledLabels !== undefined ? controlledLabels : internalLabels;

  // postMessage 메시지 전송 헬퍼
  const postToFigure = useCallback((payload: Record<string, any>) => {
    try {
      const cw = iframeRef.current?.contentWindow;
      if (cw) {
        cw.postMessage({ source: "openedu-harness", ...payload }, "*");
      }
    } catch {
      // 보안 제약 또는 언마운트 예외 무시
    }
  }, []);

  // 투시 모드 토글
  const toggleSeeThrough = useCallback(() => {
    const next = !isSeeThrough;
    if (controlledSeeThrough === undefined) {
      setInternalSeeThrough(next);
    }
    postToFigure({ type: "toggle-seethrough", value: next, seeThrough: next });
    onAction?.("toggle-seethrough", { seeThrough: next });
  }, [isSeeThrough, controlledSeeThrough, postToFigure, onAction]);

  // 라벨 토글
  const toggleLabels = useCallback(() => {
    const next = !isLabels;
    if (controlledLabels === undefined) {
      setInternalLabels(next);
    }
    postToFigure({ type: "toggle-labels", value: next, labels: next });
    onAction?.("toggle-labels", { labels: next });
  }, [isLabels, controlledLabels, postToFigure, onAction]);

  // 360도 자동 회전 토글
  const toggleRotation = useCallback(() => {
    const next = !isRotating;
    setIsRotating(next);
    postToFigure({ type: "toggle-rotate", value: next, rotate: next });
    onAction?.("toggle-rotate", { isRotating: next });
  }, [isRotating, postToFigure, onAction]);

  // 줌 인/아웃/리셋
  const handleZoom = useCallback(
    (delta: number) => {
      setZoomLevel((prev) => {
        const next = Math.max(50, Math.min(200, prev + delta));
        postToFigure({ type: "set-zoom", zoom: next / 100, level: next });
        onAction?.("zoom", { level: next });
        return next;
      });
    },
    [postToFigure, onAction]
  );

  const resetZoom = useCallback(() => {
    setZoomLevel(100);
    postToFigure({ type: "set-zoom", zoom: 1.0, level: 100 });
    onAction?.("zoom-reset", { level: 100 });
  }, [postToFigure, onAction]);

  // 제어 프로퍼티 변경 시 iframe 동기화
  useEffect(() => {
    if (controlledSeeThrough !== undefined) {
      postToFigure({ type: "toggle-seethrough", value: controlledSeeThrough, seeThrough: controlledSeeThrough });
    }
  }, [controlledSeeThrough, postToFigure]);

  useEffect(() => {
    if (controlledLabels !== undefined) {
      postToFigure({ type: "toggle-labels", value: controlledLabels, labels: controlledLabels });
    }
  }, [controlledLabels, postToFigure]);

  // iframe 내부 이벤트 청취 (양방향 postMessage)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      // ColorFigure 교구 프로토콜 메시지 수신 처리
      if (data.source === "colorfigure" || data.type === "colorfigure-action" || data.action) {
        const actionName = data.action || data.type || "action";
        const state = data.payload ?? data.state ?? data;
        onAction?.(actionName, state);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onAction]);

  // 콘텐츠 소스 변경 감지 및 iframe 로드/에러 네이티브 리스너
  useEffect(() => {
    if (src || srcDoc) {
      setIsLoading(true);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [src, srcDoc]);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };
    const handleLoad = () => {
      setIsLoading(false);
    };
    el.addEventListener("error", handleError);
    el.addEventListener("load", handleLoad);
    return () => {
      el.removeEventListener("error", handleError);
      el.removeEventListener("load", handleLoad);
    };
  }, [src, srcDoc]);

  // 규격 스타일 계산
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  const rootClass = [
    "oe-color-figure",
    "openedu-color-figure",
    `oe-color-figure--${surface}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure
      id={`oe-figure-${containerId.replace(/:/g, "")}`}
      className={rootClass}
      data-surface={surface}
      data-testid="color-figure"
      style={{
        width: widthStyle,
        height: heightStyle,
        ...style,
      }}
      aria-label={title}
    >
      {/* 56px 전자칠판 터치 친화적 상단 컨트롤 바 */}
      <div
        className="oe-color-figure__toolbar"
        role="toolbar"
        aria-label={`${title} 조작 도구`}
      >
        <div className="oe-color-figure__title-group">
          <span className="oe-color-figure__title" title={title}>
            {title}
          </span>
        </div>

        <div className="oe-color-figure__controls">
          {/* 360도 회전 토글 버튼 */}
          <button
            type="button"
            className="oe-color-figure__btn oe-color-figure__btn--rotate"
            data-active={isRotating ? "true" : undefined}
            aria-pressed={isRotating}
            aria-label="360도 회전"
            title="360도 자동 회전 전환"
            onClick={toggleRotation}
          >
            <Icon name="arrows-clockwise" />
            <span className="oe-color-figure__btn-label">회전</span>
          </button>

          {/* 투시(See-Through) 모드 토글 버튼 */}
          <button
            type="button"
            className="oe-color-figure__btn oe-color-figure__btn--seethrough"
            data-active={isSeeThrough ? "true" : undefined}
            aria-pressed={isSeeThrough}
            aria-label="투시 모드"
            title="내부 구조 투시(See-Through) 보기"
            onClick={toggleSeeThrough}
          >
            <Icon name="eye" />
            <span className="oe-color-figure__btn-label">투시</span>
          </button>

          {/* 부품 라벨(Labels) 토글 버튼 */}
          <button
            type="button"
            className="oe-color-figure__btn oe-color-figure__btn--labels"
            data-active={isLabels ? "true" : undefined}
            aria-pressed={isLabels}
            aria-label="부품 라벨"
            title="부품 명칭 및 설명 라벨 표시"
            onClick={toggleLabels}
          >
            <Icon name="tag" />
            <span className="oe-color-figure__btn-label">라벨</span>
          </button>

          {/* 줌 컨트롤 그룹 */}
          <div className="oe-color-figure__zoom-group" role="group" aria-label="화면 확대 및 축소">
            <button
              type="button"
              className="oe-color-figure__btn oe-color-figure__btn--zoom-out"
              aria-label="축소"
              title="축소 (50%까지)"
              disabled={zoomLevel <= 50}
              onClick={() => handleZoom(-10)}
            >
              <Icon name="magnifying-glass-minus" />
            </button>

            <button
              type="button"
              className="oe-color-figure__btn oe-color-figure__btn--zoom-reset"
              aria-label="원래 크기"
              title="기본 크기 (100%)로 복원"
              onClick={resetZoom}
            >
              <span className="oe-color-figure__zoom-readout">{zoomLevel}%</span>
            </button>

            <button
              type="button"
              className="oe-color-figure__btn oe-color-figure__btn--zoom-in"
              aria-label="확대"
              title="확대 (200%까지)"
              disabled={zoomLevel >= 200}
              onClick={() => handleZoom(10)}
            >
              <Icon name="magnifying-glass-plus" />
            </button>
          </div>
        </div>
      </div>

      {/* 뷰포트 영역: iframe 및 로딩 스켈레톤, Fallback */}
      <div className="oe-color-figure__viewport">
        {isLoading ? (
          <div
            className="oe-color-figure__loading-overlay"
            role="status"
            aria-live="polite"
            aria-label="교구 콘텐츠를 불러오는 중입니다"
          >
            <Skeleton className="oe-color-figure__skeleton" />
            <div className="oe-color-figure__loading-text">
              <span className="oe-spinner" role="presentation" />
              <span>교구 3D 에셋을 불러오는 중...</span>
            </div>
          </div>
        ) : null}

        {hasError ? (
          <div
            className="oe-color-figure__fallback"
            role="alert"
            data-testid="color-figure-fallback"
          >
            <div className="oe-color-figure__fallback-icon">
              <Icon name="cube-transparent" />
            </div>
            <p className="oe-color-figure__fallback-title">교구 콘텐츠를 표시할 수 없습니다</p>
            <p className="oe-color-figure__fallback-desc">
              HTML 소스코드(`srcDoc`) 또는 접근 가능한 URL(`src`)이 제공되지 않았습니다.
            </p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={src}
            srcDoc={srcDoc}
            title={title}
            data-testid="color-figure-iframe"
            aria-label={title}
            className="oe-color-figure__iframe"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {children}
      </div>
    </figure>
  );
}
