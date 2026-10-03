import React, { forwardRef, type HTMLAttributes } from "react";
import "./mobile.css";

export interface AppBarProps extends HTMLAttributes<HTMLElement> {
  glass?: boolean;
  sticky?: boolean;
  children: React.ReactNode;
}

export const AppBar = forwardRef<HTMLElement, AppBarProps>(
  ({ glass = true, sticky = true, className = "", children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={[
          "oe-app-bar",
          glass ? "oe-app-bar--glass oe-glass oe-glass--blur" : "",
          sticky ? "oe-app-bar--sticky" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <div className="oe-app-bar__inner">{children}</div>
      </header>
    );
  }
);
AppBar.displayName = "AppBar";

export interface AppBarTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const AppBarTitle = forwardRef<HTMLHeadingElement, AppBarTitleProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={["oe-app-bar__title", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </h1>
    );
  }
);
AppBarTitle.displayName = "AppBarTitle";

export interface AppBarActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AppBarActions = forwardRef<HTMLDivElement, AppBarActionsProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-app-bar__actions", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AppBarActions.displayName = "AppBarActions";
