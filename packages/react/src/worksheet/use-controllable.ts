import { useState } from "react";

/** Controlled when `value` is defined, otherwise keeps its own state. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState<T>(defaultValue);
  const current = value ?? inner;
  const set = (next: T) => {
    setInner(next);
    onChange?.(next);
  };
  return [current, set] as const;
}
