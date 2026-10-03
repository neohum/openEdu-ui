import React, { useRef, useState, useEffect } from "react";
import "./pickers.css";

export interface MonthPickerProps {
  value?: string; // "YYYY-MM"
  onChange?: (monthStr: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function MonthPicker({
  value = "",
  onChange,
  placeholder = "YYYY-MM",
  label,
  error,
  disabled,
  className = "",
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialYear = value ? parseInt(value.split("-")[0] || "2026", 10) : new Date().getFullYear();
  const [viewYear, setViewYear] = useState(initialYear);

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

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleSelect = (m: number) => {
    const formattedMonth = `${viewYear}-${String(m).padStart(2, "0")}`;
    onChange?.(formattedMonth);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={["oe-month-picker-root", className].filter(Boolean).join(" ")}
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
          🗓️
        </span>
      </button>

      {open && (
        <div
          className="oe-picker-dropdown oe-month-picker-dropdown oe-glass oe-glass--frosted"
          role="dialog"
          aria-label="연월 선택"
        >
          <div className="oe-month-picker__header">
            <button
              type="button"
              className="oe-calendar__nav-btn"
              onClick={() => setViewYear(viewYear - 1)}
              aria-label="이전 연도"
            >
              ‹
            </button>
            <span className="oe-calendar__title">{viewYear}년</span>
            <button
              type="button"
              className="oe-calendar__nav-btn"
              onClick={() => setViewYear(viewYear + 1)}
              aria-label="다음 연도"
            >
              ›
            </button>
          </div>

          <div className="oe-month-picker__grid">
            {months.map((m) => {
              const monthStr = `${viewYear}-${String(m).padStart(2, "0")}`;
              const isSelected = value === monthStr;
              return (
                <button
                  key={m}
                  type="button"
                  className={[
                    "oe-month-btn",
                    isSelected ? "oe-month-btn--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelect(m)}
                >
                  {m}월
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
