import React, { forwardRef, type HTMLAttributes } from "react";
import "./skeleton.css";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ circle = false, className = "", style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-skeleton", circle ? "oe-skeleton--circle" : "", className]
          .filter(Boolean)
          .join(" ")}
        style={style}
        aria-hidden="true"
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";
