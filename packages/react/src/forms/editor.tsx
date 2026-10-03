import React, { useRef, useState, forwardRef } from "react";
import "./forms.css";

export interface EditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  minHeight?: string | number;
  className?: string;
}

export const Editor = forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      value,
      defaultValue = "",
      onChange,
      placeholder = "내용을 입력하세요...",
      label,
      error,
      minHeight = 160,
      className = "",
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [content, setContent] = useState(value !== undefined ? value : defaultValue);

    const updateContent = (newText: string) => {
      setContent(newText);
      onChange?.(newText);
    };

    const wrapSelection = (prefix: string, suffix: string = prefix) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selected = text.substring(start, end) || "텍스트";

      const replaced = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
      updateContent(replaced);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }, 0);
    };

    return (
      <div
        ref={ref}
        className={["oe-editor-container", className].filter(Boolean).join(" ")}
      >
        {label && <label className="oe-label">{label}</label>}
        <div className="oe-editor-toolbar">
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="굵게"
            onClick={() => wrapSelection("**", "**")}
          >
            <b>B</b>
          </button>
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="기울임"
            onClick={() => wrapSelection("*", "*")}
          >
            <i>I</i>
          </button>
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="밑줄"
            onClick={() => wrapSelection("<u>", "</u>")}
          >
            <u>U</u>
          </button>
          <div className="oe-editor-tool-sep" />
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="글머리 기호"
            onClick={() => wrapSelection("\n- ", "\n")}
          >
            • 목록
          </button>
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="번호 매기기"
            onClick={() => wrapSelection("\n1. ", "\n")}
          >
            1. 목록
          </button>
          <div className="oe-editor-tool-sep" />
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="수식 입력"
            onClick={() => wrapSelection("$", "$")}
          >
            ∑ 수식
          </button>
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="코드 블록"
            onClick={() => wrapSelection("\n```\n", "\n```\n")}
          >
            &lt;/&gt; 코드
          </button>
          <button
            type="button"
            className="oe-editor-tool-btn"
            title="인용구"
            onClick={() => wrapSelection("\n> ", "\n")}
          >
            ” 인용
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          placeholder={placeholder}
          style={{ minHeight }}
          className={[
            "oe-editor-textarea",
            error ? "oe-editor-textarea--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onChange={(e) => updateContent(e.target.value)}
        />

        {error && (
          <p className="oe-field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Editor.displayName = "Editor";
