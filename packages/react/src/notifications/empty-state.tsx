import React, { forwardRef, type HTMLAttributes } from "react";
import "./notifications.css";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={["oe-empty-state", className].filter(Boolean).join(" ")}
        {...props}
      >
        {icon && <div className="oe-empty-state__icon">{icon}</div>}
        <h3 className="oe-empty-state__title">{title}</h3>
        {description && <p className="oe-empty-state__desc">{description}</p>}
        {action && <div className="oe-empty-state__action">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
