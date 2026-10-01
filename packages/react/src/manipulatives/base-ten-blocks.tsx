import { useState } from "react";
import { Button } from "../primitives/button.tsx";
import { Icon } from "../primitives/icon.tsx";
import { Input } from "../primitives/input.tsx";
import { clamp } from "./snap.ts";

const PLACES = [
  { unit: 100, name: "백" },
  { unit: 10, name: "십" },
  { unit: 1, name: "일" },
] as const;

export type BaseTenBlocksProps = {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  label?: string;
};

/** Number ⇄ blocks, bound in both directions: the number is the only state. */
export function BaseTenBlocks({ value: valueProp, defaultValue = 0, onChange, max = 999, label = "수" }: BaseTenBlocksProps) {
  const [inner, setInner] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const value = valueProp ?? inner;
  const set = (next: number) => {
    const n = clamp(next, 0, max);
    setInner(n);
    onChange?.(n);
  };

  return (
    <div className="oe-blocks">
      <Input
        label={label}
        inputMode="numeric"
        value={draft ?? String(value)}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) set(n);
        }}
        onBlur={() => setDraft(null)}
      />
      <div className="oe-blocks__places">
        {PLACES.map(({ unit, name }) => {
          const count = Math.floor(value / unit) % 10;
          return (
            <div key={unit} role="group" aria-label={`${name}의 자리`} className="oe-blocks__place" data-unit={unit}>
              <div className="oe-blocks__stack" role="img" aria-label={`${name} 블록 ${count}개`}>
                {Array.from({ length: count }, (_, i) => (
                  <span key={i} className="oe-block" data-unit={unit} />
                ))}
              </div>
              <div className="oe-blocks__controls">
                <Button variant="secondary" size="sm" aria-label={`${name} 블록 추가`} disabled={value + unit > max} onClick={() => set(value + unit)}>
                  <Icon name="plus" />
                </Button>
                <Button variant="secondary" size="sm" aria-label={`${name} 블록 제거`} disabled={count === 0} onClick={() => set(value - unit)}>
                  <Icon name="minus" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
