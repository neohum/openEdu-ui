export type ScoreResult = "O" | "X" | "△" | number | string;

export interface CheckScoreGridProps {
  /** 총 문항 수 (기본값: 20) */
  itemCount?: number;
  /** 문항별 채점 결과 맵 (1-based index: 1, 2, 3...) */
  scores?: Record<number, ScoreResult | null | undefined>;
  /** 문항별 배점 (1-based index 맵 또는 0-based 배열) */
  points?: Record<number, number> | number[];
  /** 총점 (직접 지정하거나 미지정 시 산출 가능) */
  totalScore?: number | string;
  /** 확인 서명란 표시 여부 (기본값: true) */
  showSignature?: boolean;
  /** 서명란 제목 (기본값: "채점자 확인") */
  signatureLabel?: string;
  /** 채점일 (예: "2026. 10. 02.") */
  signatureDate?: string;
  /** 서명자 이름 또는 확인 표기 (예: "홍길동", "(인)") */
  signatureName?: string;
  /** 1개 표 테이블 행당 표시할 문항 수 (기본값: 10) */
  columnsPerRow?: number;
  /** 문항 셀 클릭 콜백 (디지털 채점 시뮬레이션용) */
  onScoreClick?: (itemNumber: number) => void;
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function CheckScoreGrid({
  itemCount = 20,
  scores = {},
  points,
  totalScore,
  showSignature = true,
  signatureLabel = "채점자 확인",
  signatureDate,
  signatureName,
  columnsPerRow = 10,
  onScoreClick,
  className,
}: CheckScoreGridProps) {
  const getPoint = (num: number): number | undefined => {
    if (!points) return undefined;
    if (Array.isArray(points)) return points[num - 1];
    return points[num];
  };

  // Compute calculated total score if not provided
  let calculatedScore: number | undefined = undefined;
  if (totalScore === undefined && points) {
    let sum = 0;
    let hasAnyScore = false;
    for (let i = 1; i <= itemCount; i++) {
      const p = getPoint(i) ?? 0;
      const res = scores[i];
      if (res === "O") {
        sum += p;
        hasAnyScore = true;
      } else if (typeof res === "number") {
        sum += res;
        hasAnyScore = true;
      }
    }
    if (hasAnyScore) calculatedScore = sum;
  }

  const displayTotal = totalScore !== undefined ? totalScore : calculatedScore;

  // Split items into chunks of `columnsPerRow`
  const rowsCount = Math.ceil(itemCount / columnsPerRow);
  const chunkedRows = Array.from({ length: rowsCount }, (_, rIdx) => {
    const start = rIdx * columnsPerRow + 1;
    const end = Math.min(start + columnsPerRow - 1, itemCount);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  const rootClass = ["oe-check-score-grid", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} data-testid="check-score-grid">
      <div className="oe-check-score-grid__tables">
        {chunkedRows.map((rowItems, chunkIdx) => (
          <table key={chunkIdx} className="oe-check-score-grid__table">
            <thead>
              <tr>
                <th scope="row" className="oe-check-score-grid__th oe-check-score-grid__th--label">
                  문항
                </th>
                {rowItems.map((num) => (
                  <th key={num} scope="col" className="oe-check-score-grid__th">
                    {num}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points && (
                <tr>
                  <th scope="row" className="oe-check-score-grid__th oe-check-score-grid__th--label">
                    배점
                  </th>
                  {rowItems.map((num) => (
                    <td key={num} className="oe-check-score-grid__td oe-check-score-grid__td--point">
                      {getPoint(num) !== undefined ? `${getPoint(num)}` : "-"}
                    </td>
                  ))}
                </tr>
              )}
              <tr>
                <th scope="row" className="oe-check-score-grid__th oe-check-score-grid__th--label">
                  채점
                </th>
                {rowItems.map((num) => {
                  const result = scores[num];
                  const isClickable = !!onScoreClick;

                  return (
                    <td
                      key={num}
                      className={[
                        "oe-check-score-grid__td",
                        "oe-check-score-grid__td--result",
                        isClickable && "oe-check-score-grid__td--interactive",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => onScoreClick?.(num)}
                      data-result={result ?? undefined}
                      aria-label={`${num}번 문항 채점 결과: ${result ?? "미기재"}`}
                    >
                      {result === "O" && <span className="oe-check-score-grid__mark-o">O</span>}
                      {result === "X" && <span className="oe-check-score-grid__mark-x">X</span>}
                      {result !== "O" && result !== "X" && (result ?? "")}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        ))}
      </div>

      {/* Total Score & Signature Summary Box */}
      {(displayTotal !== undefined || showSignature) && (
        <div className="oe-check-score-grid__summary">
          {displayTotal !== undefined && (
            <div className="oe-check-score-grid__total-box">
              <span className="oe-check-score-grid__total-label">총 득점</span>
              <span className="oe-check-score-grid__total-value">{displayTotal}점</span>
            </div>
          )}

          {showSignature && (
            <div className="oe-check-score-grid__signature-box">
              <div className="oe-check-score-grid__signature-header">
                <span>{signatureLabel}</span>
                {signatureDate && (
                  <span className="oe-check-score-grid__signature-date">{signatureDate}</span>
                )}
              </div>
              <div className="oe-check-score-grid__signature-seal">
                {signatureName ? (
                  <span className="oe-check-score-grid__signer">{signatureName}</span>
                ) : (
                  <span className="oe-check-score-grid__seal-placeholder">(서명 또는 인)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
