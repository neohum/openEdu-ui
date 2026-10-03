import React, { useState } from "react";
import "./pickers.css";

export interface CalendarProps {
  value?: string; // YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  className = "",
}: CalendarProps) {
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const formatDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className={["oe-calendar", className].filter(Boolean).join(" ")}>
      <div className="oe-calendar__header">
        <button
          type="button"
          className="oe-calendar__nav-btn"
          onClick={handlePrevMonth}
          aria-label="이전 달"
        >
          ‹
        </button>
        <span className="oe-calendar__title">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          className="oe-calendar__nav-btn"
          onClick={handleNextMonth}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="oe-calendar__weekdays">
        {dayNames.map((name) => (
          <span key={name} className="oe-calendar__weekday">
            {name}
          </span>
        ))}
      </div>

      <div className="oe-calendar__grid">
        {/* Leading days from previous month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span
            key={`prev-${i}`}
            className="oe-calendar__day oe-calendar__day--outside"
          >
            {prevMonthDays - firstDayOfWeek + i + 1}
          </span>
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDay(day);
          const isSelected = value === dateStr;
          const isBeforeMin = minDate && dateStr < minDate;
          const isAfterMax = maxDate && dateStr > maxDate;
          const isDisabled = isBeforeMin || isAfterMax;

          return (
            <button
              key={`curr-${day}`}
              type="button"
              disabled={Boolean(isDisabled)}
              className={[
                "oe-calendar__day",
                isSelected ? "oe-calendar__day--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange?.(dateStr)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
