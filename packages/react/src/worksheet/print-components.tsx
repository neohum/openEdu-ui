import * as React from "react";

/* ==========================================================================
   1. 원고지 / 십자 깍두기 공책 (SquareGridCell & SquareGridRow)
   ========================================================================== */
export interface SquareGridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  sizeMm?: number;
  showCrossLines?: boolean;
  char?: string;
}

export function SquareGridCell({
  sizeMm = 12,
  showCrossLines = true,
  char = "",
  className = "",
  style,
  ...props
}: SquareGridCellProps) {
  return (
    <div
      style={{
        width: `${sizeMm}mm`,
        height: `${sizeMm}mm`,
        minWidth: `${sizeMm}mm`,
        minHeight: `${sizeMm}mm`,
        borderWidth: "0.5pt",
        borderStyle: "solid",
        ...style,
      }}
      className={`oe-square-grid-cell ${className}`}
      {...props}
    >
      {showCrossLines && (
        <>
          <div
            style={{ borderWidth: "0.25pt", borderTopStyle: "dashed" }}
            className="oe-square-grid-cell__h-line"
          />
          <div
            style={{ borderWidth: "0.25pt", borderLeftStyle: "dashed" }}
            className="oe-square-grid-cell__v-line"
          />
        </>
      )}
      {char && (
        <span
          style={{ fontSize: `${sizeMm * 0.65}mm` }}
          className="oe-square-grid-cell__char"
        >
          {char}
        </span>
      )}
    </div>
  );
}

export interface SquareGridRowProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 8 | 10;
  sizeMm?: number;
  showCrossLines?: boolean;
  sampleText?: string;
  number?: number;
}

export function SquareGridRow({
  cols = 10,
  sizeMm = 12,
  showCrossLines = true,
  sampleText = "",
  number,
  className = "",
  ...props
}: SquareGridRowProps) {
  const chars = sampleText.split("");
  return (
    <div className={`oe-square-grid-row ${className}`} {...props}>
      {number !== undefined && (
        <span className="oe-square-grid-row__number">{number}.</span>
      )}
      <div className="oe-square-grid-row__cells">
        {Array.from({ length: cols }).map((_, i) => (
          <SquareGridCell
            key={i}
            sizeMm={sizeMm}
            showCrossLines={showCrossLines}
            char={chars[i] || ""}
          />
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   2. 4줄 영어/알파벳 노트 (FourLineRow)
   ========================================================================== */
export interface FourLineRowProps extends React.HTMLAttributes<HTMLDivElement> {
  heightMm?: number;
  sampleText?: string;
}

export function FourLineRow({
  heightMm = 10,
  sampleText = "",
  className = "",
  style,
  ...props
}: FourLineRowProps) {
  const lineGap = heightMm / 3;

  return (
    <div
      style={{ height: `${heightMm}mm`, minHeight: `${heightMm}mm`, ...style }}
      className={`oe-four-line-row ${className}`}
      {...props}
    >
      <div style={{ top: 0, borderWidth: "0.5pt", borderTopStyle: "solid" }} className="oe-four-line__line1" />
      <div style={{ top: `${lineGap}mm`, borderWidth: "0.5pt", borderTopStyle: "dashed" }} className="oe-four-line__line2" />
      <div style={{ top: `${lineGap * 2}mm`, borderWidth: "1pt", borderTopStyle: "solid" }} className="oe-four-line__line3" />
      <div style={{ top: `${lineGap * 3}mm`, borderWidth: "0.5pt", borderTopStyle: "solid" }} className="oe-four-line__line4" />
      {sampleText && (
        <span
          style={{ bottom: `${lineGap * 0.95}mm`, fontSize: `${lineGap * 1.75}mm` }}
          className="oe-four-line__text"
        >
          {sampleText}
        </span>
      )}
    </div>
  );
}

/* ==========================================================================
   3. 수학 연산 세로셈 블록 (MathColumnForm)
   ========================================================================== */
export interface MathColumnFormProps extends React.HTMLAttributes<HTMLDivElement> {
  operation?: "+" | "−" | "×";
  topNum?: number | string;
  bottomNum?: number | string;
  carry?: number | string;
  answer?: number | string;
  digits?: number;
  showGuideLine?: boolean;
}

export function MathColumnForm({
  operation = "+",
  topNum = 487,
  bottomNum = 265,
  carry = 1,
  answer = "",
  digits = 3,
  showGuideLine = true,
  className = "",
  style,
  ...props
}: MathColumnFormProps) {
  const topDigits = String(topNum).padStart(digits, " ").split("");
  const botDigits = String(bottomNum).padStart(digits, " ").split("");
  const ansDigits = String(answer || "").padStart(digits, " ").split("");

  return (
    <div
      style={{ borderWidth: "0.5pt", borderStyle: "solid", ...style }}
      className={`oe-math-column-form ${className}`}
      {...props}
    >
      <div className="oe-math-column__carry-row">
        {Array.from({ length: digits }).map((_, i) => (
          <div
            key={i}
            style={{ width: "22px", height: "18px", borderWidth: "0.5pt", borderStyle: "dashed" }}
            className="oe-math-column__carry-box"
          >
            {i === digits - 2 && carry ? carry : ""}
          </div>
        ))}
      </div>

      <div className="oe-math-column__num-row">
        <span className="oe-math-column__op-space" />
        {topDigits.map((d, i) => (
          <span
            key={i}
            style={showGuideLine ? { borderWidth: "0.25pt", borderRightStyle: "dotted" } : undefined}
            className="oe-math-column__digit"
          >
            {d === " " ? "" : d}
          </span>
        ))}
      </div>

      <div className="oe-math-column__num-row">
        <span className="oe-math-column__op-symbol">{operation}</span>
        {botDigits.map((d, i) => (
          <span
            key={i}
            style={showGuideLine ? { borderWidth: "0.25pt", borderRightStyle: "dotted" } : undefined}
            className="oe-math-column__digit"
          >
            {d === " " ? "" : d}
          </span>
        ))}
      </div>

      <div style={{ borderWidth: "1pt", borderTopStyle: "solid" }} className="oe-math-column__calc-line" />

      <div className="oe-math-column__ans-row">
        {answer && <span className="oe-sr-only">{answer}</span>}
        <span className="oe-math-column__op-space" />
        {ansDigits.map((d, i) => (
          <span key={i} className="oe-math-column__ans-digit">
            {d === " " ? "" : d}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   4. 수 모형 및 구체물 격자 (CpaTenFrame)
   ========================================================================== */
export interface CpaTenFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  filledCount?: number;
  sizeMm?: number;
  label?: string;
}

export function CpaTenFrame({
  filledCount = 7,
  sizeMm = 8,
  label = "10개 묶음 상자",
  className = "",
  ...props
}: CpaTenFrameProps) {
  return (
    <div className={`oe-cpa-ten-frame ${className}`} {...props}>
      {label && (
        <span className="oe-cpa-ten-frame__label">
          {label} ({filledCount}/10)
        </span>
      )}
      <div style={{ borderWidth: "1pt", borderStyle: "solid" }} className="oe-cpa-ten-frame__grid">
        {Array.from({ length: 10 }).map((_, idx) => {
          const isFilled = idx < filledCount;
          return (
            <div
              key={idx}
              style={{
                width: `${sizeMm}mm`,
                height: `${sizeMm}mm`,
                minWidth: `${sizeMm}mm`,
                minHeight: `${sizeMm}mm`,
                borderWidth: "0.5pt",
                borderStyle: "solid",
              }}
              className="oe-cpa-ten-frame__cell"
            >
              {isFilled && (
                <div
                  style={{ width: `${sizeMm * 0.55}mm`, height: `${sizeMm * 0.55}mm` }}
                  className="oe-cpa-ten-frame__token"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. 서술형 줄노트 (LinedArea)
   ========================================================================== */
export interface LinedAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  lineGapMm?: 8 | 10 | 12;
  lineCount?: number;
  showNumbers?: boolean;
}

export function LinedArea({
  lineGapMm = 10,
  lineCount = 4,
  showNumbers = true,
  className = "",
  ...props
}: LinedAreaProps) {
  return (
    <div className={`oe-lined-area ${className}`} {...props}>
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={i}
          style={{
            height: `${lineGapMm}mm`,
            minHeight: `${lineGapMm}mm`,
            borderBottomWidth: "0.5pt",
            borderBottomStyle: "solid",
          }}
          className="oe-lined-area__line"
        >
          {showNumbers && (
            <span className="oe-lined-area__number">({i + 1})</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   6. 문항 메타 헤더 (WorksheetHeader)
   ========================================================================== */
export interface WorksheetHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  unit?: string;
  gradeClass?: string;
  showScoreBox?: boolean;
}

export function WorksheetHeader({
  title = "5학년 1학기 수학 형성평가",
  unit = "4단원. 분수의 덧셈과 뺄셈",
  gradeClass = "5학년 ____반 ____번",
  showScoreBox = true,
  className = "",
  ...props
}: WorksheetHeaderProps) {
  return (
    <header className={`oe-worksheet-header ${className}`} {...props}>
      <div className="oe-worksheet-header__titles">
        <div className="oe-worksheet-header__unit">
          <span className="oe-worksheet-header__badge">openEdu-ui Print</span>
          <span>{unit}</span>
        </div>
        <h1 className="oe-worksheet-header__title">{title}</h1>
      </div>

      <div className="oe-worksheet-header__info">
        <div className="oe-worksheet-header__student-box">
          <span className="oe-worksheet-header__grade-class">{gradeClass}</span>
          <span className="oe-worksheet-header__name">이름: ____________</span>
        </div>

        {showScoreBox && (
          <div className="oe-worksheet-header__score-box">
            <span className="oe-worksheet-header__score-label">확인</span>
            <span className="oe-worksheet-header__score-sign">(인)</span>
          </div>
        )}
      </div>
    </header>
  );
}
