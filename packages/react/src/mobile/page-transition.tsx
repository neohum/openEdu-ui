import React, { forwardRef, type HTMLAttributes } from "react";
import "./mobile.css";

export type TransitionType = "fade" | "slide" | "zoom" | "drill";

export interface PageTransitionProps extends HTMLAttributes<HTMLDivElement> {
  type?: TransitionType;
  children: React.ReactNode;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ type = "fade", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "oe-page-transition",
          `oe-page-transition--${type}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageTransition.displayName = "PageTransition";

export interface PageBoundaryProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageBoundary = forwardRef<HTMLDivElement, PageBoundaryProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-page-boundary", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageBoundary.displayName = "PageBoundary";
