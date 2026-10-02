import { useState, useId, type ButtonHTMLAttributes, type KeyboardEvent } from "react";

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
};

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled,
  className,
  id: customId,
  ...rest
}: SwitchProps) {
  const generatedId = useId();
  const switchId = customId || generatedId;
  const labelId = `${switchId}-label`;

  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
    rest.onKeyDown?.(e);
  };

  return (
    <label
      htmlFor={switchId}
      className={["oe-switch-wrapper", disabled ? "oe-switch-wrapper--disabled" : undefined, className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        {...rest}
        id={switchId}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : rest["aria-label"] || "스위치"}
        disabled={disabled}
        onClick={(e) => {
          toggle();
          rest.onClick?.(e);
        }}
        onKeyDown={handleKeyDown}
        className="oe-switch"
        data-state={isChecked ? "checked" : "unchecked"}
      >
        <span className="oe-switch-thumb" data-state={isChecked ? "checked" : "unchecked"} />
      </button>
      {label ? (
        <span id={labelId} className="oe-switch-label">
          {label}
        </span>
      ) : null}
    </label>
  );
}
