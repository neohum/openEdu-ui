import type { CSSProperties, ReactNode } from "react";

export interface TwoColumnExamLayoutProps {
  /** 시험지 상단 헤더 (ExamTitleHeader, StudentInfoStrip 등) */
  header?: ReactNode;
  /** 좌측 단 콘텐츠 (지문 또는 1단 문항 목록) */
  leftColumn?: ReactNode;
  /** 우측 단 콘텐츠 (우측 문항 목록) */
  rightColumn?: ReactNode;
  /** 좌측 지문 전용 콘텐츠 (leftColumn 대신 간편 전달용) */
  passage?: ReactNode;
  /** 좌측 지문 제목 (기본값: "지문") */
  passageTitle?: string;
  /** 우측 문항 전용 콘텐츠 (rightColumn 대신 간편 전달용) */
  questions?: ReactNode;
  /** 중앙 수직 구분선 표시 여부 (기본값: true) */
  showDivider?: boolean;
  /** 좌우 단 비율 (기본값: "5:5") */
  columnRatio?: "5:5" | "4:6" | "6:4";
  /** 하단 페이지 번호 */
  pageNumber?: number;
  /** 전체 페이지 수 */
  totalPages?: number;
  /** 하단 커스텀 푸터 */
  footer?: ReactNode;
  /** 접근성 라벨 (기본값: "2단 시험지 레이아웃") */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function TwoColumnExamLayout({
  header,
  leftColumn,
  rightColumn,
  passage,
  passageTitle = "지문",
  questions,
  showDivider = true,
  columnRatio = "5:5",
  pageNumber,
  totalPages,
  footer,
  label = "2단 시험지 레이아웃",
  className = "",
  style,
}: TwoColumnExamLayoutProps) {
  const rootClass = ["oe-two-col-exam", className].filter(Boolean).join(" ");

  const resolvedLeft =
    leftColumn ??
    (passage ? (
      <div className="oe-two-col-exam__passage-card" data-testid="two-column-passage">
        <div className="oe-two-col-exam__passage-header">{passageTitle}</div>
        <div className="oe-two-col-exam__passage-body">{passage}</div>
      </div>
    ) : null);

  const resolvedRight = rightColumn ?? questions;

  return (
    <section
      className={rootClass}
      style={style}
      aria-label={label}
      data-testid="two-column-exam-layout"
      data-ratio={columnRatio}
      data-divider={showDivider ? "true" : "false"}
    >
      {header ? <header className="oe-two-col-exam__header">{header}</header> : null}

      <div className="oe-two-col-exam__body">
        <div className="oe-two-col-exam__col oe-two-col-exam__col--left" data-testid="two-column-left">
          {resolvedLeft}
        </div>

        {showDivider ? (
          <div
            className="oe-two-col-exam__divider"
            role="separator"
            aria-orientation="vertical"
            data-testid="two-column-divider"
          />
        ) : null}

        <div className="oe-two-col-exam__col oe-two-col-exam__col--right" data-testid="two-column-right">
          {resolvedRight}
        </div>
      </div>

      {(footer || pageNumber !== undefined) ? (
        <footer className="oe-two-col-exam__footer" data-testid="two-column-footer">
          {footer ?? (
            <span className="oe-two-col-exam__page-num">
              - {pageNumber}{totalPages !== undefined ? ` / ${totalPages}` : ""} -
            </span>
          )}
        </footer>
      ) : null}
    </section>
  );
}
