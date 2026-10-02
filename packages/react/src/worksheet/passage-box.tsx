import type { ReactNode } from "react";

export type PassageBoxVariant = "default" | "bordered" | "dashed";

export interface PassageBoxProps {
  /** 보기 / 지문 상단 타이틀 (예: "<보 기>", "[자료 1]", "[지문]") */
  title?: string;
  /**
   * 박스 스타일 변형
   * - `default`: 부드러운 회색 배경 음영
   * - `bordered`: 단단한 실선 외곽선 박스
   * - `dashed`: 점선 외곽선 박스
   */
  variant?: PassageBoxVariant;
  /** 자료 출처 (예: "- ○○일보, 2026년") */
  source?: string;
  /** 지문 또는 보기의 본문 내용 */
  children: ReactNode;
  /** 상단 타이틀 정렬 방향 (기본값: "center") */
  alignTitle?: "center" | "left";
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function PassageBox({
  title,
  variant = "default",
  source,
  children,
  alignTitle = "center",
  className,
}: PassageBoxProps) {
  const rootClass = [
    "oe-passage-box",
    `oe-passage-box--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} data-testid="passage-box" data-variant={variant}>
      {title && (
        <div
          className={[
            "oe-passage-box__header",
            `oe-passage-box__header--${alignTitle}`,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="oe-passage-box__title">{title}</span>
        </div>
      )}

      <div className="oe-passage-box__body">{children}</div>

      {source && (
        <div className="oe-passage-box__footer">
          <cite className="oe-passage-box__source">{source}</cite>
        </div>
      )}
    </div>
  );
}
