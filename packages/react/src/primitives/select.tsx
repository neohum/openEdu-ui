import {
  useState,
  useId,
  type ChangeEvent,
  type SelectHTMLAttributes,
} from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value" | "defaultValue"
> & {
  options: Array<SelectOption>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
};

export function Select({
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder,
  label,
  disabled,
  className,
  id: customId,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const labelId = `${selectId}-label`;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextVal = e.target.value;
    if (!isControlled) {
      setInternalValue(nextVal);
    }
    onChange?.(nextVal);
  };

  return (
    <div
      className={["oe-select-wrapper", disabled ? "oe-select-wrapper--disabled" : undefined, className]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <label id={labelId} htmlFor={selectId} className="oe-select-label">
          {label}
        </label>
      ) : null}
      <div className="oe-select-control">
        <select
          {...rest}
          id={selectId}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : rest["aria-label"] || "선택"}
          className="oe-select"
        >
          {placeholder ? (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="oe-select-arrow" aria-hidden="true">
          <i className="fi fi-rr-angle-small-down" />
        </span>
      </div>
    </div>
  );
}
