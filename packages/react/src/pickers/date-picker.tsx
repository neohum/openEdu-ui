import React, { useRef, useState, useEffect } from "react";
import { Calendar } from "./calendar.tsx";
import "./pickers.css";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "YYYY-MM-DD",
  minDate,
  maxDate,
  label,
  error,
  disabled,
  className = "",
}: DatePickerProps) {
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

  const handleSelect = (selectedDate: string) => {
    onChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={["oe-date-picker-root", className].filter(Boolean).join(" ")}
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
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "oe-picker-val" : "oe-picker-placeholder"}>
          {value || placeholder}
        </span>
        <span className="oe-picker-icon" aria-hidden="true">
          📅
        </span>
      </button>

      {open && (
        <div
          className="oe-picker-dropdown oe-glass oe-glass--frosted"
          role="dialog"
          aria-label="날짜 선택"
        >
          <Calendar
            value={value}
            onChange={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
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
