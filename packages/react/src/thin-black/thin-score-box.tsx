import React, { forwardRef, type HTMLAttributes } from "react";
import "./thin-black.css";

export interface RubricCriteria {
  criteria: string;
  points: number | string;
}

export interface ThinScoreBoxProps extends HTMLAttributes<HTMLTableElement> {
  maxScore?: number | string;
  rubrics?: RubricCriteria[];
  showCheckRow?: boolean;
}

export const ThinScoreBox = forwardRef<HTMLTableElement, ThinScoreBoxProps>(
  (
    {
      maxScore,
      rubrics,
      showCheckRow = true,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <table
        ref={ref}
        className={["oe-thin-score-box", className].filter(Boolean).join(" ")}
        {...props}
      >
        <thead>
          <tr>
            <th>채점 기준</th>
            <th style={{ width: "60px" }}>배점</th>
            {showCheckRow && <th style={{ width: "60px" }}>득점</th>}
          </tr>
        </thead>
        <tbody>
          {rubrics && rubrics.length > 0 ? (
            rubrics.map((r, i) => (
              <tr key={i}>
                <td style={{ textAlign: "left" }}>{r.criteria}</td>
                <td>{r.points}</td>
                {showCheckRow && <td></td>}
              </tr>
            ))
          ) : (
            <tr>
              <td>풀이 과정의 타당성 및 정확한 정답 도출</td>
              <td>{maxScore || "4"}</td>
              {showCheckRow && <td></td>}
            </tr>
          )}
        </tbody>
      </table>
    );
  }
);
ThinScoreBox.displayName = "ThinScoreBox";
