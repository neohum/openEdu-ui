import {
  useState,
  useId,
  type ChangeEvent,
  type HTMLAttributes,
} from "react";

export type ColorPreset = {
  label: string;
  value: string;
};

export const DEFAULT_EDU_PRESETS: ColorPreset[] = [
  { label: "딥그린", value: "#0f291e" }, // lint-ignore
  { label: "화이트", value: "#ffffff" }, // lint-ignore
  { label: "바이올렛", value: "#8b5cf6" }, // lint-ignore
  { label: "에메랄드", value: "#10b981" }, // lint-ignore
  { label: "앰버", value: "#f59e0b" }, // lint-ignore
  { label: "로즈", value: "#f43f5e" }, // lint-ignore
  { label: "스카이", value: "#0ea5e9" }, // lint-ignore
  { label: "옐로우", value: "#fde047" }, // lint-ignore
  { label: "인디고", value: "#4f46e5" }, // lint-ignore
  { label: "슬레이트", value: "#64748b" }, // lint-ignore
];

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  label?: string;
  disabled?: boolean;
  presets?: ColorPreset[];
};

function normalizeHex(input: string): string | null {
  const clean = input.trim();
  const hexMatch = clean.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!hexMatch) return null;
  const hex = hexMatch[1]!;
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }
  return `#${hex}`.toLowerCase();
}

export function ColorPicker({
  value: controlledValue,
  defaultValue = "#0f291e", // lint-ignore
  onChange,
  label,
  disabled = false,
  presets = DEFAULT_EDU_PRESETS,
  className,
  id: customId,
  ...rest
}: ColorPickerProps) {
  const generatedId = useId();
  const pickerId = customId || generatedId;
  const labelId = `${pickerId}-label`;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [textInput, setTextInput] = useState(currentValue);

  // Sync text input with currentValue when controlledValue changes
  const normalizedCurrent = normalizeHex(currentValue) || currentValue;

  const updateColor = (nextColor: string) => {
    if (disabled) return;
    const normalized = normalizeHex(nextColor) || nextColor;
    if (!isControlled) {
      setInternalValue(normalized);
    }
    setTextInput(normalized);
    onChange?.(normalized);
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextInput(val);
    const normalized = normalizeHex(val);
    if (normalized) {
      if (!isControlled) {
        setInternalValue(normalized);
      }
      onChange?.(normalized);
    }
  };

  const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateColor(e.target.value);
  };

  return (
    <div
      {...rest}
      id={pickerId}
      className={["oe-color-picker", disabled ? "oe-color-picker--disabled" : undefined, className]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <span id={labelId} className="oe-color-picker-label">
          {label}
        </span>
      ) : null}

      {/* 10 Educational Presets */}
      <div
        className="oe-color-presets"
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : "색상 프리셋"}
      >
        {presets.map((preset) => {
          const isSelected =
            normalizedCurrent.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.value}
              type="button"
              disabled={disabled}
              aria-label={`${preset.label} (${preset.value})`}
              aria-pressed={isSelected}
              data-selected={isSelected ? "true" : undefined}
              className="oe-color-chip"
              style={{ "--oe-chip-color": preset.value } as React.CSSProperties}
              onClick={() => updateColor(preset.value)}
            />
          );
        })}
      </div>

      {/* Inputs: Native Color Picker + HEX Text Input */}
      <div className="oe-color-inputs">
        <label className="oe-color-native-wrapper">
          <input
            type="color"
            value={normalizedCurrent.startsWith("#") ? normalizedCurrent : "#0f291e"} // lint-ignore
            onChange={handleNativeChange}
            disabled={disabled}
            aria-label={`${label || "색상"} 팔레트`}
            className="oe-color-native"
          />
          <span
            className="oe-color-swatch"
            style={{ backgroundColor: normalizedCurrent }}
            aria-hidden="true"
          />
        </label>

        <input
          type="text"
          value={textInput}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="#000000" // lint-ignore
          maxLength={7}
          aria-label={`${label || "색상"} HEX 코드`}
          className="oe-color-text-input"
        />
      </div>
    </div>
  );
}
