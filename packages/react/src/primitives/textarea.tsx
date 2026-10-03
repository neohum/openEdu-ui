import React, {
  forwardRef,
  useId,
  useRef,
  useEffect,
  type TextareaHTMLAttributes,
} from "react";
import "./textarea.css";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  autoGrow?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      autoGrow = true,
      id: customId,
      className = "",
      rows = 3,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const adjustHeight = () => {
      const el = internalRef.current;
      if (!el || !autoGrow) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`;
    };

    useEffect(() => {
      if (autoGrow) adjustHeight();
    }, [props.value, autoGrow]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow) adjustHeight();
      onChange?.(e);
    };

    return (
      <div className={["oe-textarea-field", className].filter(Boolean).join(" ")}>
        {label && (
          <label htmlFor={id} className="oe-label">
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={id}
          rows={rows}
          className="oe-textarea"
          aria-invalid={Boolean(error) || undefined}
          onChange={handleChange}
          {...props}
        />
        {error ? (
          <p className="oe-field-error" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="oe-field-hint">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
