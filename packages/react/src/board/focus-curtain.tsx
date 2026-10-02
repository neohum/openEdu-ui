import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export type CurtainEdge = "top" | "bottom" | "left" | "right";
export type CurtainMode = "curtain" | "spotlight";
export type SpotlightShape = "circle" | "rect";

/** Fraction of the content that is revealed (0 = fully covered, 1 = fully open). */
export function openRatioFromPointer(edge: CurtainEdge, point: { x: number; y: number }, rect: { left: number; top: number; width: number; height: number }) {
  const covered =
    edge === "top" ? (point.y - rect.top) / rect.height
    : edge === "bottom" ? 1 - (point.y - rect.top) / rect.height
    : edge === "left" ? (point.x - rect.left) / rect.width
    : 1 - (point.x - rect.left) / rect.width;
  return Math.min(1, Math.max(0, 1 - covered));
}

/** Relative fraction position of the spotlight center (0 to 1 for x and y). */
export function spotlightPositionFromPointer(
  point: { x: number; y: number },
  rect: { left: number; top: number; width: number; height: number }
): { x: number; y: number } {
  const x = rect.width > 0 ? (point.x - rect.left) / rect.width : 0.5;
  const y = rect.height > 0 ? (point.y - rect.top) / rect.height : 0.5;
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
}

export type FocusCurtainProps = {
  /** Content hidden behind the curtain. */
  children: ReactNode;
  label: string;
  mode?: CurtainMode;
  edge?: CurtainEdge;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Keyboard step as a fraction. */
  step?: number;
  /** Spotlight radius in pixels (default: 100). */
  spotlightRadius?: number;
  /** Spotlight window shape (default: "circle"). */
  spotlightShape?: SpotlightShape;
  /** Controlled spotlight position as fractions ({ x: 0..1, y: 0..1 }). */
  spotlightPosition?: { x: number; y: number };
  /** Default spotlight position ({ x: 0..1, y: 0..1 }). Defaults to { x: 0.5, y: 0.5 }. */
  defaultSpotlightPosition?: { x: number; y: number };
  /** Callback when spotlight position changes. */
  onSpotlightPositionChange?: (position: { x: number; y: number }) => void;
};

export function FocusCurtain({
  children,
  label,
  mode = "curtain",
  edge = "top",
  value: valueProp,
  defaultValue,
  onValueChange,
  step = 0.1,
  spotlightRadius = 100,
  spotlightShape = "circle",
  spotlightPosition: spotlightPositionProp,
  defaultSpotlightPosition,
  onSpotlightPositionChange,
}: FocusCurtainProps) {
  const [curtainState, setCurtainState] = useState(defaultValue ?? 0);
  const curtainValue = valueProp ?? curtainState;

  const initialSpotlight =
    defaultSpotlightPosition ??
    (defaultValue !== undefined && defaultValue !== 0 ? { x: defaultValue, y: defaultValue } : { x: 0.5, y: 0.5 });
  const [spotlightState, setSpotlightState] = useState<{ x: number; y: number }>(initialSpotlight);
  const spotlightPos = spotlightPositionProp ?? spotlightState;
  const [lastAxis, setLastAxis] = useState<"x" | "y">("x");

  const host = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setCurtain = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setCurtainState(clamped);
    onValueChange?.(clamped);
  };

  const setSpotlight = (next: { x: number; y: number }, axis?: "x" | "y") => {
    const clamped = {
      x: Math.min(1, Math.max(0, next.x)),
      y: Math.min(1, Math.max(0, next.y)),
    };
    if (axis) setLastAxis(axis);
    setSpotlightState(clamped);
    onSpotlightPositionChange?.(clamped);
    onValueChange?.(axis === "y" ? clamped.y : clamped.x);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !host.current) return;
    const rect = host.current.getBoundingClientRect();
    if (mode === "spotlight") {
      setSpotlight(spotlightPositionFromPointer({ x: e.clientX, y: e.clientY }, rect));
    } else {
      setCurtain(openRatioFromPointer(edge, { x: e.clientX, y: e.clientY }, rect));
    }
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (mode === "spotlight") {
      let nextX = spotlightPos.x;
      let nextY = spotlightPos.y;
      let newAxis: "x" | "y" | undefined;

      if (e.key === "ArrowRight") {
        nextX = Math.min(1, Math.max(0, spotlightPos.x + step));
        newAxis = "x";
      } else if (e.key === "ArrowLeft") {
        nextX = Math.min(1, Math.max(0, spotlightPos.x - step));
        newAxis = "x";
      } else if (e.key === "ArrowDown") {
        nextY = Math.min(1, Math.max(0, spotlightPos.y + step));
        newAxis = "y";
      } else if (e.key === "ArrowUp") {
        nextY = Math.min(1, Math.max(0, spotlightPos.y - step));
        newAxis = "y";
      } else if (e.key === "Home") {
        nextX = 0;
        nextY = 0;
      } else if (e.key === "End") {
        nextX = 1;
        nextY = 1;
      } else {
        return;
      }
      e.preventDefault();
      setSpotlight({ x: Number(nextX.toFixed(4)), y: Number(nextY.toFixed(4)) }, newAxis);
      return;
    }

    const more = edge === "top" ? "ArrowDown" : edge === "bottom" ? "ArrowUp" : edge === "left" ? "ArrowRight" : "ArrowLeft";
    const less = { ArrowDown: "ArrowUp", ArrowUp: "ArrowDown", ArrowRight: "ArrowLeft", ArrowLeft: "ArrowRight" }[more]!;
    if (e.key === more) setCurtain(curtainValue + step);
    else if (e.key === less) setCurtain(curtainValue - step);
    else if (e.key === "Home") setCurtain(0);
    else if (e.key === "End") setCurtain(1);
    else return;
    e.preventDefault();
  };

  const onBackdropDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!host.current) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSpotlight(spotlightPositionFromPointer({ x: e.clientX, y: e.clientY }, host.current.getBoundingClientRect()));
  };

  const valuenow =
    mode === "spotlight"
      ? Math.round((lastAxis === "y" ? spotlightPos.y : spotlightPos.x) * 100)
      : Math.round(curtainValue * 100);

  const style = {
    "--oe-open": curtainValue,
    "--oe-spotlight-x": spotlightPos.x,
    "--oe-spotlight-y": spotlightPos.y,
    "--oe-spotlight-radius": `${spotlightRadius}px`,
  } as React.CSSProperties;

  return (
    <div
      ref={host}
      className="oe-curtain"
      data-mode={mode}
      data-edge={mode === "curtain" ? edge : undefined}
      data-shape={mode === "spotlight" ? spotlightShape : undefined}
      style={style}
    >
      <div className="oe-curtain__content">{children}</div>
      {mode === "curtain" && <div className="oe-curtain__shade" aria-hidden="true" />}
      {mode === "spotlight" && (
        <div
          className="oe-curtain__backdrop"
          aria-hidden="true"
          onPointerDown={onBackdropDown}
          onPointerMove={onMove}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        />
      )}
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valuenow}
        aria-valuetext={mode === "spotlight" ? `${Math.round(spotlightPos.x * 100)}%, ${Math.round(spotlightPos.y * 100)}%` : undefined}
        aria-orientation={mode === "curtain" ? (edge === "top" || edge === "bottom" ? "vertical" : "horizontal") : undefined}
        className={mode === "spotlight" ? "oe-curtain__handle oe-curtain__spotlight" : "oe-curtain__handle"}
        data-spotlight-x={mode === "spotlight" ? Math.round(spotlightPos.x * 100) : undefined}
        data-spotlight-y={mode === "spotlight" ? Math.round(spotlightPos.y * 100) : undefined}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={onMove}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={onKey}
      />
    </div>
  );
}
