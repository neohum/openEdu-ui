import React, { forwardRef } from "react";
import "./selection.css";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  size?: "sm" | "md";
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  size = "md",
  className = "",
  name,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={["oe-segmented-control", `oe-segmented-control--${size}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            className={[
              "oe-segmented-control__item",
              isSelected ? "oe-segmented-control__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
