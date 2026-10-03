import React, { forwardRef, type HTMLAttributes } from "react";
import "./mobile.css";

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-app-shell", className].filter(Boolean).join(" ")}
        {...props}
      >
        <div className="oe-app-shell__scroller">{children}</div>
      </div>
    );
  }
);
AppShell.displayName = "AppShell";
