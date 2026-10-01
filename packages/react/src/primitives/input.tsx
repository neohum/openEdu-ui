import { useId, type InputHTMLAttributes } from "react";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "aria-label"> & {
  /** Always rendered; a placeholder is never a substitute. */
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, id, className, ...rest }: InputProps) {
  const generated = useId();
  if (!label) throw new Error("Input requires a visible label");
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["oe-field", className].filter(Boolean).join(" ")}>
      <label className="oe-field__label" htmlFor={inputId}>{label}</label>
      <input {...rest} id={inputId} className="oe-field__input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} />
      {hint ? <p id={hintId} className="oe-field__hint">{hint}</p> : null}
      {error ? <p id={errorId} className="oe-field__error">{error}</p> : null}
    </div>
  );
}
