import { useState } from "react";
import { Button } from "../primitives/button.tsx";
import { Icon } from "../primitives/icon.tsx";
import { clamp } from "./snap.ts";

export type FractionBarProps = {
  denominator: number;
  /** Numerator = number of filled parts. */
  value?: number;
  defaultValue?: number;
  onChange?: (numerator: number) => void;
};

export function FractionBar({ denominator, value: valueProp, defaultValue = 0, onChange }: FractionBarProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const set = (next: number) => {
    const n = clamp(next, 0, denominator);
    setInner(n);
    onChange?.(n);
  };

  return (
    <div className="oe-fraction">
      <div role="group" aria-label={`${denominator}등분 막대`} className="oe-fraction__bar">
        {Array.from({ length: denominator }, (_, k) => (
          <button
            key={k}
            type="button"
            className="oe-fraction__part"
            aria-pressed={k < value}
            aria-label={`${k + 1}/${denominator}`}
            onClick={() => set(value === k + 1 ? k : k + 1)}
          />
        ))}
      </div>
      <output className="oe-fraction__readout" aria-live="polite">{value}/{denominator}</output>
      <div className="oe-fraction__controls">
        <Button variant="secondary" size="sm" aria-label="조각 추가" disabled={value >= denominator} onClick={() => set(value + 1)}><Icon name="plus" /></Button>
        <Button variant="secondary" size="sm" aria-label="조각 제거" disabled={value <= 0} onClick={() => set(value - 1)}><Icon name="minus" /></Button>
      </div>
    </div>
  );
}
