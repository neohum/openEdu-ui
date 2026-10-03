import React, { forwardRef, type LabelHTMLAttributes } from "react";
import "./label.css";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, optional, className = "", children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={["oe-label-primitive", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
        {required && <span className="oe-label-required" aria-hidden="true">*</span>}
        {optional && <span className="oe-label-optional">(선택)</span>}
      </label>
    );
  }
);
Label.displayName = "Label";
