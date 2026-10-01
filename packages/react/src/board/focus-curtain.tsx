import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export type CurtainEdge = "top" | "bottom" | "left" | "right";

/** Fraction of the content that is revealed (0 = fully covered, 1 = fully open). */
export function openRatioFromPointer(edge: CurtainEdge, point: { x: number; y: number }, rect: { left: number; top: number; width: number; height: number }) {
  const covered =
    edge === "top" ? (point.y - rect.top) / rect.height
    : edge === "bottom" ? 1 - (point.y - rect.top) / rect.height
    : edge === "left" ? (point.x - rect.left) / rect.width
    : 1 - (point.x - rect.left) / rect.width;
  return Math.min(1, Math.max(0, 1 - covered));
}

export type FocusCurtainProps = {
  /** Content hidden behind the curtain. */
  children: ReactNode;
  label: string;
  edge?: CurtainEdge;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Keyboard step as a fraction. */
  step?: number;
};

export function FocusCurtain({ children, label, edge = "top", value: valueProp, defaultValue = 0, onValueChange, step = 0.1 }: FocusCurtainProps) {
  const [state, setState] = useState(defaultValue);
  const value = valueProp ?? state;
  const host = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const set = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setState(clamped);
    onValueChange?.(clamped);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !host.current) return;
    set(openRatioFromPointer(edge, { x: e.clientX, y: e.clientY }, host.current.getBoundingClientRect()));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const more = edge === "top" ? "ArrowDown" : edge === "bottom" ? "ArrowUp" : edge === "left" ? "ArrowRight" : "ArrowLeft";
    const less = { ArrowDown: "ArrowUp", ArrowUp: "ArrowDown", ArrowRight: "ArrowLeft", ArrowLeft: "ArrowRight" }[more]!;
    if (e.key === more) set(value + step);
    else if (e.key === less) set(value - step);
    else if (e.key === "Home") set(0);
    else if (e.key === "End") set(1);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={host} className="oe-curtain" data-edge={edge} style={{ "--oe-open": value } as React.CSSProperties}>
      <div className="oe-curtain__content">{children}</div>
      <div className="oe-curtain__shade" aria-hidden="true" />
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-orientation={edge === "top" || edge === "bottom" ? "vertical" : "horizontal"}
        className="oe-curtain__handle"
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
