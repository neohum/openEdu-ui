import type { ReactNode } from "react";

export type AssessmentType =
  | "performance"
  | "unit"
  | "summative"
  | "diagnostic"
  | string;

export interface ExamTitleHeaderProps {
  /** 시험지 / 학습지 메인 타이틀 (예: "2026학년도 1학기 중간평가") */
  title: string;
  /** 부제목 (예: "이해와 탐구 중심 기초학력 향상 평가지") */
  subtitle?: string;
  /** 과목명 (예: "수학", "국어", "과학") */
  subject?: string;
  /** 학기 또는 시험 시기 (예: "1학기", "2학기", "중간고사") */
  semester?: string;
  /** 단원명 또는 출제 범위 (예: "3. 분수의 덧셈과 뺄셈") */
  unit?: string;
  /** 학년 / 대상 (예: "초등학교 4학년", "중학교 2학년") */
  grade?: string;
  /**
   * 평가 종류 키값
   * - `performance`: 수행평가
   * - `unit`: 단원평가
   * - `summative`: 총괄평가
   * - `diagnostic`: 진단평가
   * - 또는 커스텀 문자열
   */
  assessmentType?: AssessmentType;
  /** 평가 종류 뱃지에 표시할 커스텀 레이블 (미지정 시 assessmentType 한글명 자동 적용) */
  assessmentTypeLabel?: string;
  /** 총 문항수 (예: 20, "20문항") */
  totalQuestions?: number | string;
  /** 총점 (예: 100, "100점") */
  totalScore?: number | string;
  /** 시험 제한 시간 (예: 40, "40분") */
  timeLimit?: number | string;
  /** 수험생 유의사항 목록 또는 커스텀 안내 영역 */
  instructions?: string[] | ReactNode;
  /** 추가 헤더 슬롯 (예: 학생 인적사항 스트립, QR코드 등) */
  children?: ReactNode;
  /** 추가 CSS 클래스명 */
  className?: string;
}

const ASSESSMENT_LABELS: Record<string, string> = {
  performance: "수행평가",
  unit: "단원평가",
  summative: "총괄평가",
  diagnostic: "진단평가",
};

export function ExamTitleHeader({
  title,
  subtitle,
  subject,
  semester,
  unit,
  grade,
  assessmentType,
  assessmentTypeLabel,
  totalQuestions,
  totalScore,
  timeLimit,
  instructions,
  children,
  className,
}: ExamTitleHeaderProps) {
  const badgeText =
    assessmentTypeLabel ||
    (assessmentType ? ASSESSMENT_LABELS[assessmentType] || assessmentType : undefined);

  const formattedTime =
    timeLimit !== undefined
      ? typeof timeLimit === "number"
        ? `${timeLimit}분`
        : timeLimit
      : undefined;

  const formattedQuestions =
    totalQuestions !== undefined
      ? typeof totalQuestions === "number"
        ? `${totalQuestions}문항`
        : totalQuestions
      : undefined;

  const formattedScore =
    totalScore !== undefined
      ? typeof totalScore === "number"
        ? `${totalScore}점`
        : totalScore
      : undefined;

  const rootClass = ["oe-exam-header", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass} data-testid="exam-title-header">
      {/* Top Banner / Assessment Badge & Meta */}
      <div className="oe-exam-header__top">
        {badgeText && (
          <span className="oe-exam-header__badge" data-type={assessmentType}>
            {badgeText}
          </span>
        )}
        <div className="oe-exam-header__crumbs">
          {grade && <span className="oe-exam-header__crumb">{grade}</span>}
          {semester && <span className="oe-exam-header__crumb">{semester}</span>}
          {subject && <span className="oe-exam-header__crumb oe-exam-header__crumb--subject">{subject}</span>}
        </div>
      </div>

      {/* Main Title Area */}
      <div className="oe-exam-header__titles">
        <h1 className="oe-exam-header__title">{title}</h1>
        {subtitle && <p className="oe-exam-header__subtitle">{subtitle}</p>}
        {unit && <div className="oe-exam-header__unit">단원: {unit}</div>}
      </div>

      {/* Meta Information Bar (Questions, Points, Time) */}
      {(formattedQuestions || formattedScore || formattedTime) && (
        <div className="oe-exam-header__meta-bar">
          {formattedQuestions && (
            <div className="oe-exam-header__meta-item">
              <span className="oe-exam-header__meta-label">문항수</span>
              <span className="oe-exam-header__meta-value">{formattedQuestions}</span>
            </div>
          )}
          {formattedScore && (
            <div className="oe-exam-header__meta-item">
              <span className="oe-exam-header__meta-label">총점</span>
              <span className="oe-exam-header__meta-value">{formattedScore}</span>
            </div>
          )}
          {formattedTime && (
            <div className="oe-exam-header__meta-item">
              <i className="fi fi-rr-clock oe-exam-header__meta-icon" aria-hidden="true" />
              <span className="oe-exam-header__meta-label">제한시간</span>
              <span className="oe-exam-header__meta-value">{formattedTime}</span>
            </div>
          )}
        </div>
      )}

      {/* Optional Children slot (e.g. StudentInfoStrip or extra controls) */}
      {children && <div className="oe-exam-header__extra">{children}</div>}

      {/* Notice / Instructions Callout Box */}
      {instructions && (
        <div className="oe-exam-header__instructions" role="region" aria-label="수험생 유의사항">
          <div className="oe-exam-header__instructions-title">
            <i className="fi fi-rr-info oe-exam-header__instructions-icon" aria-hidden="true" />
            <span>수험생 유의사항</span>
          </div>
          {Array.isArray(instructions) ? (
            <ul className="oe-exam-header__instructions-list">
              {instructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          ) : (
            <div className="oe-exam-header__instructions-content">{instructions}</div>
          )}
        </div>
      )}
    </header>
  );
}
