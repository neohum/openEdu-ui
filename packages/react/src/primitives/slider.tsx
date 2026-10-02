import {
  useState,
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue"
> & {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  label?: string;
};

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = min,
  onChange,
  label,
  disabled,
  className,
  id: customId,
  ...rest
}: SliderProps) {
  const generatedId = useId();
  const sliderId = customId || generatedId;
  const labelId = `${sliderId}-label`;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const clampAndRound = (val: number) => {
    const clamped = Math.min(max, Math.max(min, val));
    const rounded = Math.round((clamped - min) / step) * step + min;
    // Fix JS float precision
    return Number(rounded.toFixed(4));
  };

  const updateValue = (nextVal: number) => {
    if (disabled) return;
    const finalVal = clampAndRound(nextVal);
    if (!isControlled) {
      setInternalValue(finalVal);
    }
    onChange?.(finalVal);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextVal = parseFloat(e.target.value);
    updateValue(nextVal);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    let nextVal = currentValue;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      nextVal = currentValue + step;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      nextVal = currentValue - step;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextVal = min;
    } else if (e.key === "End") {
      e.preventDefault();
      nextVal = max;
    } else if (e.key === "PageUp") {
      e.preventDefault();
      nextVal = currentValue + step * 10;
    } else if (e.key === "PageDown") {
      e.preventDefault();
      nextVal = currentValue - step * 10;
    }

    if (nextVal !== currentValue) {
      updateValue(nextVal);
    }
    rest.onKeyDown?.(e);
  };

  const percentage = Math.min(100, Math.max(0, ((currentValue - min) / (max - min)) * 100));

  return (
    <div
      className={["oe-slider-wrapper", disabled ? "oe-slider-wrapper--disabled" : undefined, className]
        .filter(Boolean)
        .join(" ")}
      style={{ "--oe-slider-fill": `${percentage}%` } as React.CSSProperties}
    >
      {label ? (
        <div className="oe-slider-header">
          <label id={labelId} htmlFor={sliderId} className="oe-slider-label">
            {label}
          </label>
          <span className="oe-slider-value" aria-hidden="true">
            {currentValue}
          </span>
        </div>
      ) : null}
      <div className="oe-slider-track-container">
        <input
          {...rest}
          id={sliderId}
          type="range"
          role="slider"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : rest["aria-label"] || "슬라이더"}
          className="oe-slider-input"
        />
      </div>
    </div>
  );
}
