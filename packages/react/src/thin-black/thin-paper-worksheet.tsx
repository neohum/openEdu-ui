import React, { forwardRef, type HTMLAttributes } from "react";
import "./thin-black.css";

export interface ThinPaperWorksheetProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ThinPaperWorksheet = forwardRef<HTMLDivElement, ThinPaperWorksheetProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-thin-paper-worksheet", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ThinPaperWorksheet.displayName = "ThinPaperWorksheet";

export interface ThinPaperExamHeaderProps {
  title: string;
  subject?: string;
  semester?: string;
  schoolName?: string;
  grade?: string | number;
  classNum?: string | number;
  studentNumber?: string | number;
  studentName?: string;
  className?: string;
}

export function ThinPaperExamHeader({
  title,
  subject,
  semester,
  schoolName = "초등학교",
  grade = "4",
  classNum = "",
  studentNumber = "",
  studentName = "",
  className = "",
}: ThinPaperExamHeaderProps) {
  return (
    <header className={["oe-thin-exam-header", className].filter(Boolean).join(" ")}>
      <div className="oe-thin-exam-title-row">
        <div>
          {semester && (
            <span style={{ fontSize: "9pt", fontWeight: 600, display: "block" }}>
              {semester}
            </span>
          )}
          <h2 className="oe-thin-exam-title">{title}</h2>
        </div>
        {subject && <span className="oe-thin-exam-subject">{subject}</span>}
      </div>

      <table className="oe-thin-student-info-table">
        <tbody>
          <tr>
            <th style={{ width: "20%" }}>학교</th>
            <td style={{ width: "25%" }}>{schoolName}</td>
            <th style={{ width: "10%" }}>학년 / 반</th>
            <td style={{ width: "15%" }}>
              {grade}학년 {classNum ? `${classNum}반` : "   반"}
            </td>
            <th style={{ width: "10%" }}>번호</th>
            <td style={{ width: "10%" }}>{studentNumber}</td>
            <th style={{ width: "10%" }}>이름</th>
            <td style={{ width: "15%" }}>{studentName}</td>
          </tr>
        </tbody>
      </table>
    </header>
  );
}

export interface ThinPaperLayoutProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2;
  children: React.ReactNode;
}

export const ThinPaperLayout = forwardRef<HTMLDivElement, ThinPaperLayoutProps>(
  ({ columns = 2, className = "", children, ...props }, ref) => {
    if (columns === 1) {
      return (
        <div
          ref={ref}
          className={["oe-thin-layout--single-col", className].filter(Boolean).join(" ")}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={["oe-thin-layout--two-col", className].filter(Boolean).join(" ")}
        {...props}
      >
        <div className="oe-thin-layout__divider" />
        {children}
      </div>
    );
  }
);
ThinPaperLayout.displayName = "ThinPaperLayout";
