import React, { forwardRef, type HTMLAttributes } from "react";
import "./input-group.css";

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-input-group", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroup.displayName = "InputGroup";

export interface InputAddonProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const InputAddon = forwardRef<HTMLSpanElement, InputAddonProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={["oe-input-addon", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </span>
    );
  }
);
InputAddon.displayName = "InputAddon";
