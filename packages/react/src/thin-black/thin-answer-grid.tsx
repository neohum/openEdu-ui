import React from "react";
import "./thin-black.css";

export interface ThinAnswerGridProps {
  type?: "choice" | "blank";
  choiceCount?: number;
  label?: string;
  className?: string;
}

export function ThinAnswerGrid({
  type = "choice",
  choiceCount = 5,
  label = "답",
  className = "",
}: ThinAnswerGridProps) {
  const circles = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

  if (type === "blank") {
    return (
      <div className={["oe-thin-blank-answer", className].filter(Boolean).join(" ")}>
        <span>{label}:</span>
        <span className="oe-thin-blank-line" />
      </div>
    );
  }

  return (
    <div className={["oe-thin-answer-grid", className].filter(Boolean).join(" ")}>
      <span>{label}:</span>
      {Array.from({ length: choiceCount }).map((_, i) => (
        <span key={i} className="oe-thin-omr-bubble">
          {circles[i] || i + 1}
        </span>
      ))}
    </div>
  );
}
