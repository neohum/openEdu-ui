import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import "./selection.css";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      selected = false,
      onSelect,
      onRemove,
      icon,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        className={[
          "oe-chip",
          selected ? "oe-chip--selected" : "",
          onRemove ? "oe-chip--removable" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onSelect}
        {...props}
      >
        {icon && <span className="oe-chip__icon">{icon}</span>}
        <span className="oe-chip__label">{children}</span>
        {onRemove && (
          <span
            role="button"
            aria-label="삭제"
            className="oe-chip__remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </span>
        )}
      </button>
    );
  }
);
Chip.displayName = "Chip";
