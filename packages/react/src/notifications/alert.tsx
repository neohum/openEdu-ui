import React, { forwardRef, type HTMLAttributes } from "react";
import "./notifications.css";

export type AlertTone = "default" | "info" | "success" | "warning" | "danger";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      tone = "default",
      title,
      icon,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={[
          "oe-alert",
          `oe-alert--${tone}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {icon && <div className="oe-alert__icon">{icon}</div>}
        <div className="oe-alert__content">
          {title && <h4 className="oe-alert__title">{title}</h4>}
          <div className="oe-alert__desc">{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";
