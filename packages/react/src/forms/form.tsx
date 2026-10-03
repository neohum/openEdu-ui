import React, { createContext, useContext, useId, forwardRef, type HTMLAttributes } from "react";
import "./forms.css";

interface FormFieldContextValue {
  id: string;
  name: string;
  error?: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export interface FormProps extends HTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={["oe-form", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </form>
    );
  }
);
Form.displayName = "Form";

export interface FormFieldProps {
  name: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ name, error, children }: FormFieldProps) {
  const id = useId();
  return (
    <FormFieldContext.Provider value={{ id, name, error }}>
      {children}
    </FormFieldContext.Provider>
  );
}

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-form-item", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormItem.displayName = "FormItem";

export interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ required, className = "", children, ...props }, ref) => {
    const ctx = useContext(FormFieldContext);
    return (
      <label
        ref={ref}
        htmlFor={ctx?.id}
        className={["oe-label", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
        {required && <span className="oe-label-required">*</span>}
      </label>
    );
  }
);
FormLabel.displayName = "FormLabel";

export function FormControl({ children }: { children: React.ReactElement<any> }) {
  const ctx = useContext(FormFieldContext);
  return React.cloneElement(children, {
    id: ctx?.id,
    name: ctx?.name,
    "aria-invalid": Boolean(ctx?.error) || undefined,
    "aria-describedby": ctx?.error ? `${ctx.id}-error` : undefined,
  } as React.HTMLAttributes<HTMLElement>);
}

export function FormMessage({ className = "" }: { className?: string }) {
  const ctx = useContext(FormFieldContext);
  if (!ctx?.error) return null;

  return (
    <p
      id={`${ctx.id}-error`}
      role="alert"
      className={["oe-field-error", className].filter(Boolean).join(" ")}
    >
      {ctx.error}
    </p>
  );
}
