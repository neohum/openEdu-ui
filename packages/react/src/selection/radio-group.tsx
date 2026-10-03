import React, { createContext, useContext, forwardRef, type HTMLAttributes, type InputHTMLAttributes } from "react";
import "./selection.css";

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  className = "",
  children,
  ...props
}: RadioGroupProps) {
  const [internalVal, setInternalVal] = React.useState(defaultValue || "");
  const currentValue = value !== undefined ? value : internalVal;

  const handleChange = (val: string) => {
    if (value === undefined) setInternalVal(val);
    onChange?.(val);
  };

  return (
    <RadioGroupContext.Provider
      value={{ name, value: currentValue, onChange: handleChange, disabled }}
    >
      <div
        role="radiogroup"
        className={["oe-radio-group", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string;
  label?: React.ReactNode;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, label, id: customId, className = "", disabled, ...props }, ref) => {
    const ctx = useContext(RadioGroupContext);
    const id = customId || `radio-${ctx?.name}-${value}`;
    const isChecked = ctx?.value === value;
    const isDisabled = disabled || ctx?.disabled;

    return (
      <label
        htmlFor={id}
        className={["oe-radio-item-label", className].filter(Boolean).join(" ")}
      >
        <span className="oe-radio-circle-container">
          <input
            ref={ref}
            type="radio"
            id={id}
            name={ctx?.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => ctx?.onChange?.(value)}
            className="oe-radio-input"
            {...props}
          />
          <span className="oe-radio-halo" />
          <span className="oe-radio-circle">
            <span className="oe-radio-dot" />
          </span>
        </span>
        {label && <span className="oe-radio-text">{label}</span>}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";
