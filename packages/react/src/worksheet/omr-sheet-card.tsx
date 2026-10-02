import { useState } from "react";

export interface OmrStudentInfo {
  /** 수험 번호 (예: "0415") */
  examId?: string;
  /** 학생 이름 (예: "이영희") */
  name?: string;
  /** 반 / 번호 (예: "3반 12번") */
  number?: string;
}

export interface OmrSheetCardProps {
  /** 총 문항 수 (기본값: 20) */
  questionCount?: number;
  /** 문항당 보기 개수 (기본값: 5 -> ①~⑤) */
  choiceCount?: number;
  /** 제어형 마킹 답안 맵 (문항번호 1-based -> 선택한 보기 번호 1-based) */
  answers?: Record<number, number>;
  /** 비제어형 기본 마킹 답안 맵 */
  defaultAnswers?: Record<number, number>;
  /** 마킹 변경 콜백 */
  onAnswerChange?: (
    questionNumber: number,
    choiceNumber: number,
    allAnswers: Record<number, number>
  ) => void;
  /** 문항 목록 분할 열 수 (기본값: 2) */
  columns?: number;
  /** 상단 카드 타이틀 (기본값: "OMR 답안지") */
  title?: string;
  /** 수험생 기본 정보 */
  studentInfo?: OmrStudentInfo;
  /** 읽기 전용 여부 (기본값: false) */
  readOnly?: boolean;
  /** 좌우 타이밍 트랙 바(OMR 검은 마크) 표시 여부 (기본값: true) */
  showTimingMarks?: boolean;
  /** 추가 CSS 클래스명 */
  className?: string;
}

const CIRCLED_NUMBERS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

export function OmrSheetCard({
  questionCount = 20,
  choiceCount = 5,
  answers,
  defaultAnswers = {},
  onAnswerChange,
  columns = 2,
  title = "OMR 답안지",
  studentInfo,
  readOnly = false,
  showTimingMarks = true,
  className,
}: OmrSheetCardProps) {
  const [internalAnswers, setInternalAnswers] = useState<Record<number, number>>(defaultAnswers);
  const currentAnswers = answers !== undefined ? answers : internalAnswers;

  const handleSelect = (qNum: number, cNum: number) => {
    if (readOnly) return;
    // Toggle if same choice clicked or select new choice
    const nextVal = currentAnswers[qNum] === cNum ? 0 : cNum;
    const nextAnswers = { ...currentAnswers };
    if (nextVal === 0) {
      delete nextAnswers[qNum];
    } else {
      nextAnswers[qNum] = nextVal;
    }

    if (answers === undefined) {
      setInternalAnswers(nextAnswers);
    }
    onAnswerChange?.(qNum, nextVal, nextAnswers);
  };

  // Group questions into columns
  const perCol = Math.ceil(questionCount / columns);
  const colGroups = Array.from({ length: columns }, (_, colIdx) => {
    const start = colIdx * perCol + 1;
    const end = Math.min(start + perCol - 1, questionCount);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  const rootClass = ["oe-omr-card", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} data-testid="omr-sheet-card">
      {/* Header Bar */}
      <div className="oe-omr-card__header">
        <div className="oe-omr-card__header-left">
          <span className="oe-omr-card__title">{title}</span>
          <span className="oe-omr-card__subtitle">
            (컴퓨터용 사인펜 마킹 시뮬레이션)
          </span>
        </div>

        {studentInfo && (
          <div className="oe-omr-card__student-info">
            {studentInfo.examId && (
              <span className="oe-omr-card__info-item">
                <span className="oe-omr-card__info-label">수험번호:</span>
                <span className="oe-omr-card__info-val">{studentInfo.examId}</span>
              </span>
            )}
            {studentInfo.name && (
              <span className="oe-omr-card__info-item">
                <span className="oe-omr-card__info-label">성명:</span>
                <span className="oe-omr-card__info-val">{studentInfo.name}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main OMR Sheet Area with Side Timing Marks */}
      <div className="oe-omr-card__body">
        {showTimingMarks && (
          <div className="oe-omr-card__timing-track" aria-hidden="true">
            {Array.from({ length: perCol + 1 }).map((_, idx) => (
              <div key={idx} className="oe-omr-card__timing-block" />
            ))}
          </div>
        )}

        <div className="oe-omr-card__columns">
          {colGroups.map((qList, colIdx) => (
            <div key={colIdx} className="oe-omr-card__column">
              <div className="oe-omr-card__col-header">
                <span className="oe-omr-card__th-num">문항</span>
                <span className="oe-omr-card__th-choices">답안 마킹란</span>
              </div>

              {qList.map((qNum) => {
                const selectedChoice = currentAnswers[qNum];

                return (
                  <div
                    key={qNum}
                    className="oe-omr-card__row"
                    role="radiogroup"
                    aria-label={`${qNum}번 문항 답안`}
                  >
                    <span className="oe-omr-card__q-num">{qNum}</span>
                    <div className="oe-omr-card__bubbles">
                      {Array.from({ length: choiceCount }, (_, cIdx) => {
                        const choiceNum = cIdx + 1;
                        const isMarked = selectedChoice === choiceNum;
                        const symbol =
                          CIRCLED_NUMBERS[cIdx] || `(${choiceNum})`;

                        return (
                          <button
                            key={choiceNum}
                            type="button"
                            className="oe-omr-card__bubble"
                            data-marked={isMarked || undefined}
                            role="radio"
                            aria-checked={isMarked}
                            aria-label={`${qNum}번 ${choiceNum}번 보기`}
                            disabled={readOnly}
                            onClick={() => handleSelect(qNum, choiceNum)}
                          >
                            <span className="oe-omr-card__bubble-inner">
                              {symbol}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {showTimingMarks && (
          <div className="oe-omr-card__timing-track" aria-hidden="true">
            {Array.from({ length: perCol + 1 }).map((_, idx) => (
              <div key={idx} className="oe-omr-card__timing-block" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
