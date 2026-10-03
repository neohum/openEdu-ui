import React, { forwardRef, type HTMLAttributes } from "react";
import "./thin-black.css";

export interface ThinPassageBoxProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  source?: string;
  children: React.ReactNode;
}

export const ThinPassageBox = forwardRef<HTMLDivElement, ThinPassageBoxProps>(
  ({ label = "보기", source, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-thin-passage-box", className].filter(Boolean).join(" ")}
        {...props}
      >
        <span className="oe-thin-passage-box__label">[{label}]</span>
        <div>{children}</div>
        {source && (
          <div
            style={{
              textAlign: "right",
              fontSize: "8pt",
              marginTop: "2mm",
              fontStyle: "italic",
            }}
          >
            - {source} -
          </div>
        )}
      </div>
    );
  }
);
ThinPassageBox.displayName = "ThinPassageBox";
