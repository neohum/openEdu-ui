import { useState, type ChangeEvent } from "react";

export interface LinedAnswerBoxProps {
  /** 줄 수 (기본값: 5) */
  lineCount?: number;
  /** 각 줄의 높이 (기본값: "2rem") */
  lineHeight?: string | number;
  /** 각 줄 좌측에 줄 번호(1, 2, 3...) 표시 여부 (기본값: false) */
  showLineNumbers?: boolean;
  /** 상단 레이블 (기본값: "서술형 답안 작성란") */
  label?: string;
  /** 제어형 텍스트 값 */
  value?: string;
  /** 비제어형 기본 텍스트 값 */
  defaultValue?: string;
  /** 텍스트 입력 변경 시 콜백 */
  onChange?: (value: string) => void;
  /** 플레이스홀더 안내문 */
  placeholder?: string;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 추가 CSS 클래스명 */
  className?: string;
}

export function LinedAnswerBox({
  lineCount = 5,
  lineHeight = "2rem",
  showLineNumbers = false,
  label = "서술형 답안 작성란",
  value,
  defaultValue = "",
  onChange,
  placeholder,
  readOnly = false,
  className,
}: LinedAnswerBoxProps) {
  const [internalText, setInternalText] = useState(defaultValue);
  const currentText = value !== undefined ? value : internalText;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setInternalText(e.target.value);
    }
    onChange?.(e.target.value);
  };

  const parsedLineHeight =
    typeof lineHeight === "number" ? `${lineHeight}px` : lineHeight;

  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const rootClass = ["oe-lined-answer-box", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} data-testid="lined-answer-box">
      {label && (
        <div className="oe-lined-answer-box__header">
          <span className="oe-lined-answer-box__label">
            <i className="fi fi-rr-edit oe-lined-answer-box__icon" aria-hidden="true" />
            {label}
          </span>
          <span className="oe-lined-answer-box__meta">{lineCount}줄</span>
        </div>
      )}

      <div
        className="oe-lined-answer-box__container"
        style={{
          ["--oe-line-height" as string]: parsedLineHeight,
        }}
      >
        {/* Background ruled lines with optional line numbers */}
        <div className="oe-lined-answer-box__lines" aria-hidden="true">
          {lines.map((num) => (
            <div key={num} className="oe-lined-answer-box__row">
              {showLineNumbers && (
                <span className="oe-lined-answer-box__line-number">{num}</span>
              )}
              <div className="oe-lined-answer-box__line-ruled" />
            </div>
          ))}
        </div>

        {/* Textarea for digital input / preview */}
        <textarea
          className="oe-lined-answer-box__textarea"
          value={currentText}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={lineCount}
          style={{
            lineHeight: parsedLineHeight,
            paddingLeft: showLineNumbers ? "2.5rem" : "0.75rem",
          }}
          aria-label={label || "서술형 답안"}
        />
      </div>
    </div>
  );
}
