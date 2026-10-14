import { useState, type CSSProperties, type ReactNode } from "react";
import { MathSymbolToolbar } from "../icons/math-symbol-toolbar.tsx";

export type MathEquationToken =
  | { type: "frac"; numerator: string; denominator: string }
  | { type: "sqrt"; radicand: string }
  | { type: "sup"; base: string; exponent: string }
  | { type: "sub"; base: string; subscript: string }
  | { type: "op"; value: string }
  | { type: "text"; value: string };

const TOKEN_PATTERN =
  /(\\frac\{[^{}]+\}\{[^{}]+\}|\d+\/\d+|\\sqrt\{[^{}]+\}|sqrt\([^()]+\)|[a-zA-Z0-9]+\^\{[^{}]+\}|[a-zA-Z0-9]+\^[a-zA-Z0-9]+|[a-zA-Z0-9]+_\{[^{}]+\}|[a-zA-Z0-9]+_[a-zA-Z0-9]+|\+|-|\*|×|÷|=|±|≤|≥|<|>)/g;

/**
 * 무거운 외부 LaTeX 런타임 없이 분수(frac), 근호(sqrt), 위/아래 첨자(sup/sub) 표현식을
 * 구조화된 시맨틱 토큰 배열로 변환합니다.
 */
export function parseMathEquationTokens(expr: string): MathEquationToken[] {
  if (!expr) return [];
  const rawParts = expr.split(TOKEN_PATTERN).filter((part) => part.length > 0);
  const tokens: MathEquationToken[] = [];

  for (const raw of rawParts) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const latexFrac = trimmed.match(/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/);
    if (latexFrac && latexFrac[1] && latexFrac[2]) {
      tokens.push({ type: "frac", numerator: latexFrac[1], denominator: latexFrac[2] });
      continue;
    }

    const slashFrac = trimmed.match(/^(\d+)\/(\d+)$/);
    if (slashFrac && slashFrac[1] && slashFrac[2]) {
      tokens.push({ type: "frac", numerator: slashFrac[1], denominator: slashFrac[2] });
      continue;
    }

    const latexSqrt = trimmed.match(/^\\sqrt\{([^{}]+)\}$/);
    if (latexSqrt && latexSqrt[1]) {
      tokens.push({ type: "sqrt", radicand: latexSqrt[1] });
      continue;
    }

    const fnSqrt = trimmed.match(/^sqrt\(([^()]+)\)$/);
    if (fnSqrt && fnSqrt[1]) {
      tokens.push({ type: "sqrt", radicand: fnSqrt[1] });
      continue;
    }

    const supBraced = trimmed.match(/^([a-zA-Z0-9]+)\^\{([^{}]+)\}$/);
    if (supBraced && supBraced[1] && supBraced[2]) {
      tokens.push({ type: "sup", base: supBraced[1], exponent: supBraced[2] });
      continue;
    }

    const supSimple = trimmed.match(/^([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)$/);
    if (supSimple && supSimple[1] && supSimple[2]) {
      tokens.push({ type: "sup", base: supSimple[1], exponent: supSimple[2] });
      continue;
    }

    const subBraced = trimmed.match(/^([a-zA-Z0-9]+)_\{([^{}]+)\}$/);
    if (subBraced && subBraced[1] && subBraced[2]) {
      tokens.push({ type: "sub", base: subBraced[1], subscript: subBraced[2] });
      continue;
    }

    const subSimple = trimmed.match(/^([a-zA-Z0-9]+)_([a-zA-Z0-9]+)$/);
    if (subSimple && subSimple[1] && subSimple[2]) {
      tokens.push({ type: "sub", base: subSimple[1], subscript: subSimple[2] });
      continue;
    }

    if (/^(\+|-|\*|×|÷|=|±|≤|≥|<|>)$/.test(trimmed)) {
      const opDisplay = trimmed === "-" ? "−" : trimmed === "*" ? "×" : trimmed;
      tokens.push({ type: "op", value: opDisplay });
      continue;
    }

    tokens.push({ type: "text", value: trimmed });
  }

  return tokens;
}

export interface MathEquationDisplayProps {
  equation: string;
  className?: string;
}

export function MathEquationDisplay({ equation, className = "" }: MathEquationDisplayProps) {
  const tokens = parseMathEquationTokens(equation);
  const rootClass = ["oe-math-eq__formula", className].filter(Boolean).join(" ");

  return (
    <span className={rootClass} role="math" aria-label={equation} data-testid="math-equation-display">
      {tokens.map((token, idx) => {
        switch (token.type) {
          case "frac":
            return (
              <span
                key={idx}
                className="oe-math-eq__frac"
                data-token-type="frac"
                aria-label={`${token.denominator}분의 ${token.numerator}`}
              >
                <span className="oe-math-eq__frac-num">{token.numerator}</span>
                <span className="oe-math-eq__frac-bar" aria-hidden="true" />
                <span className="oe-math-eq__frac-den">{token.denominator}</span>
              </span>
            );
          case "sqrt":
            return (
              <span
                key={idx}
                className="oe-math-eq__sqrt"
                data-token-type="sqrt"
                aria-label={`루트 ${token.radicand}`}
              >
                <span className="oe-math-eq__sqrt-sign" aria-hidden="true">
                  √
                </span>
                <span className="oe-math-eq__sqrt-radicand">{token.radicand}</span>
              </span>
            );
          case "sup":
            return (
              <span key={idx} className="oe-math-eq__script" data-token-type="sup">
                <span className="oe-math-eq__base">{token.base}</span>
                <sup className="oe-math-eq__sup">{token.exponent}</sup>
              </span>
            );
          case "sub":
            return (
              <span key={idx} className="oe-math-eq__script" data-token-type="sub">
                <span className="oe-math-eq__base">{token.base}</span>
                <sub className="oe-math-eq__sub">{token.subscript}</sub>
              </span>
            );
          case "op":
            return (
              <span key={idx} className="oe-math-eq__op" data-token-type="op">
                {token.value}
              </span>
            );
          case "text":
          default:
            return (
              <span key={idx} className="oe-math-eq__text" data-token-type="text">
                {token.value}
              </span>
            );
        }
      })}
    </span>
  );
}

export interface MathEquationItemProps {
  /** 문항 번호 (예: 1) */
  number?: number;
  /** 배점 (예: 4) */
  points?: number;
  /** 문항 발문 / 지시문 */
  stem: ReactNode;
  /** 구조화 수식 표현식 (예: "\\frac{3}{4} + \\sqrt{16} + x^2 = ?") */
  equation: string;
  /** 학생 답안 값 (제어 컴포넌트용) */
  value?: string;
  /** 초기 답안 값 (비제어 컴포넌트용) */
  defaultValue?: string;
  /** 답안 변경 콜백 */
  onChange?: (value: string) => void;
  /** 수식 기호 입력 툴바 표시 여부 (기본값: true) */
  showToolbar?: boolean;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 입력창 플레이스홀더 */
  placeholder?: string;
  /** 답안 입력 라벨 (기본값: "수식 답안 입력") */
  inputLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function MathEquationItem({
  number = 1,
  points = 4,
  stem,
  equation,
  value: controlledValue,
  defaultValue = "",
  onChange,
  showToolbar = true,
  readOnly = false,
  placeholder = "수식 또는 답안을 입력하세요",
  inputLabel = "수식 답안 입력",
  className = "",
  style,
}: MathEquationItemProps) {
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const currentValue = controlledValue ?? internalValue;

  const updateValue = (next: string) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const handleSelectSymbol = (symbolText: string) => {
    if (readOnly) return;
    const next = currentValue ? `${currentValue} ${symbolText}` : symbolText;
    updateValue(next);
  };

  const rootClass = ["oe-math-eq-item", className].filter(Boolean).join(" ");

  return (
    <article
      className={rootClass}
      style={style}
      aria-label={`${number}번 수식 문항`}
      data-testid="math-equation-item"
    >
      <header className="oe-math-eq-item__header">
        <span className="oe-math-eq-item__number">{number}</span>
        <div className="oe-math-eq-item__stem">{stem}</div>
        <span className="oe-math-eq-item__points">[{points}점]</span>
      </header>

      <div className="oe-math-eq-item__box">
        <MathEquationDisplay equation={equation} />
      </div>

      <div className="oe-math-eq-item__answer-area">
        <div className="oe-math-eq-item__input-row">
          <label className="oe-math-eq-item__label">
            <span>답안</span>
            <input
              type="text"
              className="oe-math-eq-item__input"
              aria-label={inputLabel}
              value={currentValue}
              disabled={readOnly}
              placeholder={placeholder}
              onChange={(e) => updateValue(e.target.value)}
            />
          </label>
          {currentValue ? (
            <div className="oe-math-eq-item__preview" aria-label="입력 수식 미리보기">
              <MathEquationDisplay equation={currentValue} />
            </div>
          ) : null}
        </div>

        {showToolbar && !readOnly ? (
          <MathSymbolToolbar
            compact
            showCategories={false}
            ariaLabel={`${number}번 문항 수식 기호 입력기`}
            onSelectSymbol={handleSelectSymbol}
          />
        ) : null}
      </div>
    </article>
  );
}
