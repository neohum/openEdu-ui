import React, { useRef, useState, useEffect } from "react";
import "./pickers.css";

export interface TimePickerProps {
  value?: string; // "HH:mm"
  onChange?: (timeStr: string) => void;
  placeholder?: string;
  stepMinutes?: number; // default 30
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value = "",
  onChange,
  placeholder = "시간 선택",
  stepMinutes = 30,
  label,
  error,
  disabled,
  className = "",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Generate slots
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }

  const handleSelect = (timeStr: string) => {
    onChange?.(timeStr);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={["oe-time-picker-root", className].filter(Boolean).join(" ")}
    >
      {label && <label className="oe-label">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        className={[
          "oe-picker-trigger",
          open ? "oe-picker-trigger--open" : "",
          error ? "oe-picker-trigger--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "oe-picker-val" : "oe-picker-placeholder"}>
          {value || placeholder}
        </span>
        <span className="oe-picker-icon" aria-hidden="true">
          🕒
        </span>
      </button>

      {open && (
        <div
          className="oe-picker-dropdown oe-time-picker-dropdown oe-glass oe-glass--frosted"
          role="listbox"
          aria-label="시간 슬롯 목록"
        >
          <div className="oe-time-picker-slots">
            {slots.map((slot) => {
              const isSelected = value === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    "oe-time-slot",
                    isSelected ? "oe-time-slot--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelect(slot)}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="oe-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
