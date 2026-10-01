import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { clamp, fractionOf, snapValue } from "./snap.ts";

export type NumberLineProps = {
  min: number;
  max: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  label?: string;
};

/** A draggable counter on a number line. It follows the finger and snaps to the grid on release. */
export function NumberLine({ min, max, step = 1, value: valueProp, defaultValue = min, onChange, label = "수직선" }: NumberLineProps) {
  const [inner, setInner] = useState(defaultValue);
  const [drag, setDrag] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const grid = { min, max, step };
  const value = valueProp ?? inner;

  const commit = (next: number) => {
    const n = clamp(next, min, max);
    setInner(n);
    onChange?.(n);
  };
  const fractionAt = (e: PointerEvent) => {
    const rect = track.current!.getBoundingClientRect();
    return rect.width === 0 ? 0 : clamp((e.clientX - rect.left) / rect.width, 0, 1);
  };
  const onKey = (e: KeyboardEvent) => {
    const next = { ArrowRight: value + step, ArrowUp: value + step, ArrowLeft: value - step, ArrowDown: value - step, Home: min, End: max }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    commit(next);
  };

  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  const position = drag ?? fractionOf(value, grid);

  return (
    <div className="oe-numberline" ref={track} style={{ "--oe-pos": `${position * 100}%` } as CSSProperties}>
      <div className="oe-numberline__axis" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} className="oe-numberline__tick" style={{ "--oe-tick": `${fractionOf(t, grid) * 100}%` } as CSSProperties}>{t}</span>
        ))}
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="oe-numberline__counter"
        data-dragging={drag !== null || undefined}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setDrag(fractionAt(e));
        }}
        onPointerMove={(e) => drag !== null && setDrag(fractionAt(e))}
        onPointerUp={(e) => {
          if (drag === null) return;
          commit(snapValue(fractionAt(e), grid));
          setDrag(null);
        }}
        onPointerCancel={() => setDrag(null)}
      />
    </div>
  );
}
