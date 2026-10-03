import React, { forwardRef, type HTMLAttributes } from "react";
import "./thin-black.css";

export interface ThinProblemBoxProps extends HTMLAttributes<HTMLDivElement> {
  num: number | string;
  points?: number | string;
  prompt: React.ReactNode;
  difficulty?: number;
  subQuestions?: React.ReactNode[];
  shape?: "circle" | "square";
  children?: React.ReactNode;
}

export const ThinProblemBox = forwardRef<HTMLDivElement, ThinProblemBoxProps>(
  (
    {
      num,
      points,
      prompt,
      difficulty,
      subQuestions,
      shape = "circle",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const formattedNum = typeof num === "number" ? String(num).padStart(2, "0") : num;

    return (
      <div
        ref={ref}
        className={["oe-thin-problem-box", className].filter(Boolean).join(" ")}
        {...props}
      >
        <div className="oe-thin-problem-box__header">
          <span
            className={[
              "oe-thin-problem-num",
              shape === "square" ? "oe-thin-problem-num--square" : "",
            ].join(" ")}
          >
            {formattedNum}
          </span>
          <div className="oe-thin-problem-prompt">
            {prompt}
            {points && (
              <span className="oe-thin-problem-points">
                &nbsp;[{typeof points === "number" ? `${points}점` : points}]
              </span>
            )}
          </div>
        </div>

        {children}

        {subQuestions && subQuestions.length > 0 && (
          <div className="oe-thin-sub-questions">
            {subQuestions.map((sq, i) => (
              <div key={i} className="oe-thin-sub-item">
                ({i + 1}) {sq}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ThinProblemBox.displayName = "ThinProblemBox";
