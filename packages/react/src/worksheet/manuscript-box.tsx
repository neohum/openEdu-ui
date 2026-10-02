export interface ManuscriptBoxProps {
  /**
   * 총 자수 규격 (기본값: 200)
   * 보통 표준 200자(10줄×20칸) 또는 400자(20줄×20칸)를 사용합니다.
   */
  charCount?: number;
  /** 한 줄당 글자 칸 수 (한국 표준 원고지는 20칸, 기본값: 20) */
  cols?: number;
  /** 세로 행 수 (미지정 시 charCount / cols 로 자동 계산) */
  rows?: number;
  /** 각 칸 중앙에 십자(+) 보조 안내선 표시 여부 (기본값: false) */
  showCrossGuides?: boolean;
  /** 행 끝에 누적 자수(20, 40, 60...) 표시 여부 (기본값: true) */
  showCountMarks?: boolean;
  /** 상단 제목/안내 레이블 (기본값: "원고지 작성란") */
  label?: string;
  /** 원고지 칸에 채울 텍스트 내용 (인쇄/화면 미리보기 시 각 칸에 1자씩 기재) */
  value?: string;
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function ManuscriptBox({
  charCount = 200,
  cols = 20,
  rows: explicitRows,
  showCrossGuides = false,
  showCountMarks = true,
  label = "원고지 작성란",
  value = "",
  className,
}: ManuscriptBoxProps) {
  const calculatedRows = explicitRows ?? Math.ceil(charCount / cols);
  const totalCells = calculatedRows * cols;

  // Split string into characters (handling newlines by wrapping or padding if desired)
  const charArray: string[] = [];
  const lines = value.split("\n");
  for (let l = 0; l < lines.length; l++) {
    const line = lines[l] ?? "";
    const lineChars = Array.from(line);
    for (const ch of lineChars) {
      if (charArray.length < totalCells) {
        charArray.push(ch);
      }
    }
    // If not the last line and not already at row end, pad till end of row (standard manuscript line-break rule)
    if (l < lines.length - 1) {
      const remainder = charArray.length % cols;
      if (remainder !== 0) {
        const padCount = cols - remainder;
        for (let p = 0; p < padCount && charArray.length < totalCells; p++) {
          charArray.push("");
        }
      }
    }
  }

  const rootClass = ["oe-manuscript-box", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} data-testid="manuscript-box">
      {label && (
        <div className="oe-manuscript-box__header">
          <span className="oe-manuscript-box__label">
            <i className="fi fi-rr-edit oe-manuscript-box__icon" aria-hidden="true" />
            {label}
          </span>
          <span className="oe-manuscript-box__spec">
            {charCount}자 ({calculatedRows}행 × {cols}칸)
          </span>
        </div>
      )}

      <div className="oe-manuscript-box__grid-wrapper">
        <div
          className="oe-manuscript-box__grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: calculatedRows }).map((_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            const rowCumulativeCount = rowNumber * cols;

            return (
              <div key={rowIndex} className="oe-manuscript-box__row">
                <div className="oe-manuscript-box__cells">
                  {Array.from({ length: cols }).map((_, colIndex) => {
                    const cellIndex = rowIndex * cols + colIndex;
                    const char = charArray[cellIndex] || "";

                    return (
                      <div
                        key={colIndex}
                        className={[
                          "oe-manuscript-box__cell",
                          showCrossGuides && "oe-manuscript-box__cell--guided",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-cell-index={cellIndex}
                      >
                        {showCrossGuides && (
                          <div
                            className="oe-manuscript-box__crosshair"
                            aria-hidden="true"
                          />
                        )}
                        <span className="oe-manuscript-box__char">{char}</span>
                      </div>
                    );
                  })}
                </div>

                {showCountMarks && (
                  <span className="oe-manuscript-box__counter">
                    {rowCumulativeCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
