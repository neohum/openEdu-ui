import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
import "./selection.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      hint,
      error,
      id: customId,
      className = "",
      checked,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <div className={["oe-checkbox-wrapper", className].filter(Boolean).join(" ")}>
        <label htmlFor={id} className="oe-checkbox-label">
          <span className="oe-checkbox-box-container">
            <input
              ref={ref}
              type="checkbox"
              id={id}
              checked={checked}
              disabled={disabled}
              className="oe-checkbox-input"
              {...props}
            />
            <span className="oe-checkbox-halo" />
            <span className="oe-checkbox-box">
              <svg
                className="oe-checkbox-check-svg"
                viewBox="0 0 12 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="1.5 5.5 4.5 8.5 10.5 1.5" />
              </svg>
            </span>
          </span>
          {label && <span className="oe-checkbox-text">{label}</span>}
        </label>
        {error ? (
          <p className="oe-field-error" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="oe-field-hint">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
