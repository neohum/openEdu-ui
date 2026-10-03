import React, { forwardRef, type HTMLAttributes } from "react";
import "./thin-black.css";

export interface ThinRuledNoteProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "ruled" | "squared";
  height?: number | string;
  label?: string;
}

export const ThinRuledNote = forwardRef<HTMLDivElement, ThinRuledNoteProps>(
  (
    {
      variant = "ruled",
      height = 120,
      label = "[ 풀이 과정 ]",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={["oe-thin-ruled-note", className].filter(Boolean).join(" ")}
        style={{ height, ...style }}
        {...props}
      >
        {label && (
          <div
            style={{
              fontSize: "8pt",
              padding: "2px 6px",
              borderBottom: "0.5px solid #000",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        )}
        <div
          className={
            variant === "squared"
              ? "oe-thin-squared-grid"
              : "oe-thin-ruled-lines"
          }
          style={{ height: typeof height === "number" ? height - 20 : "100%" }}
        />
      </div>
    );
  }
);
ThinRuledNote.displayName = "ThinRuledNote";
