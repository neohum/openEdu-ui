import type { ReactNode } from "react";

export interface StudentInfoValues {
  /** 학교명 (예: "한국초등학교") */
  school?: string;
  /** 학년 (예: 3, "3", "3학년") */
  grade?: string | number;
  /** 반 (예: 2, "2", "2반") */
  classNum?: string | number;
  /** 번호 (예: 15, "15", "15번") */
  number?: string | number;
  /** 학생 이름 (예: "김철수") */
  name?: string;
  /** 득점 또는 총점 대비 점수 (예: 95, "95/100") */
  score?: string | number;
  /** 교사/보호자 확인 도장 여부 또는 확인자 이름 (예: true, "김교사") */
  confirmed?: boolean | string | ReactNode;
}

export interface StudentInfoStripProps {
  /**
   * 표시 모드
   * - `horizontal`: 가로 1줄 스트립 형태
   * - `boxed`: 시험지 우측 상단용 콤팩트 테이블 박스 형태
   */
  mode?: "horizontal" | "boxed";
  /** 인적사항 값 */
  values?: StudentInfoValues;
  /** 점수 기재란 표시 여부 (기본값: true) */
  showScore?: boolean;
  /** 확인(도장)란 표시 여부 (기본값: true) */
  showStamp?: boolean;
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function StudentInfoStrip({
  mode = "horizontal",
  values = {},
  showScore = true,
  showStamp = true,
  className,
}: StudentInfoStripProps) {
  const {
    school,
    grade,
    classNum,
    number,
    name,
    score,
    confirmed,
  } = values;

  const rootClass = [
    "oe-student-info",
    `oe-student-info--${mode}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (mode === "boxed") {
    return (
      <div className={rootClass} data-testid="student-info-strip">
        <table className="oe-student-info__table">
          <tbody>
            <tr>
              <th scope="row" className="oe-student-info__th">학교</th>
              <td className="oe-student-info__td oe-student-info__td--school">
                {school || <span className="oe-student-info__blank" aria-hidden="true" />}
              </td>
              <th scope="row" className="oe-student-info__th">학년</th>
              <td className="oe-student-info__td oe-student-info__td--short">
                {grade !== undefined && grade !== "" ? `${grade}` : ""}
              </td>
              <th scope="row" className="oe-student-info__th">반</th>
              <td className="oe-student-info__td oe-student-info__td--short">
                {classNum !== undefined && classNum !== "" ? `${classNum}` : ""}
              </td>
              <th scope="row" className="oe-student-info__th">번호</th>
              <td className="oe-student-info__td oe-student-info__td--short">
                {number !== undefined && number !== "" ? `${number}` : ""}
              </td>
            </tr>
            <tr>
              <th scope="row" className="oe-student-info__th">이름</th>
              <td colSpan={3} className="oe-student-info__td oe-student-info__td--name">
                {name || <span className="oe-student-info__blank" aria-hidden="true" />}
              </td>
              {showScore ? (
                <>
                  <th scope="row" className="oe-student-info__th">점수</th>
                  <td className="oe-student-info__td oe-student-info__td--score">
                    {score !== undefined && score !== "" ? `${score}` : ""}
                  </td>
                </>
              ) : (
                <td colSpan={2} className="oe-student-info__td--empty" />
              )}
              {showStamp ? (
                <>
                  <th scope="row" className="oe-student-info__th">확인</th>
                  <td className="oe-student-info__td oe-student-info__td--stamp">
                    {typeof confirmed === "boolean" && confirmed ? (
                      <span className="oe-student-info__seal-mark" title="확인 완료">인</span>
                    ) : (
                      confirmed || <span className="oe-student-info__seal-guide">(인)</span>
                    )}
                  </td>
                </>
              ) : (
                <td colSpan={2} className="oe-student-info__td--empty" />
              )}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={rootClass} data-testid="student-info-strip">
      <div className="oe-student-info__group">
        <span className="oe-student-info__label">학교</span>
        <span className="oe-student-info__field oe-student-info__field--school">
          {school || <span className="oe-student-info__underline" />}
        </span>
      </div>

      <div className="oe-student-info__group oe-student-info__group--class">
        <span className="oe-student-info__field oe-student-info__field--short">
          {grade !== undefined && grade !== "" ? grade : " "}
        </span>
        <span className="oe-student-info__unit">학년</span>
        <span className="oe-student-info__field oe-student-info__field--short">
          {classNum !== undefined && classNum !== "" ? classNum : " "}
        </span>
        <span className="oe-student-info__unit">반</span>
        <span className="oe-student-info__field oe-student-info__field--short">
          {number !== undefined && number !== "" ? number : " "}
        </span>
        <span className="oe-student-info__unit">번</span>
      </div>

      <div className="oe-student-info__group">
        <span className="oe-student-info__label">이름</span>
        <span className="oe-student-info__field oe-student-info__field--name">
          {name || <span className="oe-student-info__underline" />}
        </span>
      </div>

      {showScore && (
        <div className="oe-student-info__group oe-student-info__group--score">
          <span className="oe-student-info__label">점수</span>
          <span className="oe-student-info__score-box">
            {score !== undefined && score !== "" ? score : ""}
          </span>
        </div>
      )}

      {showStamp && (
        <div className="oe-student-info__group oe-student-info__group--stamp">
          <span className="oe-student-info__label">확인</span>
          <span className="oe-student-info__stamp-circle">
            {typeof confirmed === "boolean" && confirmed ? (
              <span className="oe-student-info__seal-mark">인</span>
            ) : (
              confirmed || <span className="oe-student-info__seal-guide">(인)</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
