import React, { forwardRef, type HTMLAttributes } from "react";
import "./glass.css";

export type GlassMaterial = "morphing" | "blur" | "frosted" | "fade";

export interface GlassProps extends HTMLAttributes<HTMLDivElement> {
  material?: GlassMaterial;
  intensity?: "low" | "medium" | "high";
  children?: React.ReactNode;
}

export const Glass = forwardRef<HTMLDivElement, GlassProps>(
  (
    {
      material = "blur",
      intensity = "medium",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "oe-glass",
          `oe-glass--${material}`,
          `oe-glass--${intensity}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-material={material}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Glass.displayName = "Glass";
