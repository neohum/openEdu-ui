import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
import "./forms.css";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      hint,
      error,
      maxLength,
      showCount = false,
      value,
      id: customId,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className={["oe-text-field-container", className].filter(Boolean).join(" ")}>
        {label && (
          <label htmlFor={id} className="oe-label">
            {label}
          </label>
        )}
        <div className="oe-text-field-input-box">
          <input
            ref={ref}
            id={id}
            value={value}
            maxLength={maxLength}
            aria-invalid={Boolean(error) || undefined}
            className={["oe-input", error ? "oe-input--error" : ""].filter(Boolean).join(" ")}
            {...props}
          />
          {showCount && maxLength && (
            <span className="oe-char-count">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
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
TextField.displayName = "TextField";
