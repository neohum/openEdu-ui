import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./icon.tsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Replaces the label with a spinner while keeping the button width stable. */
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading = false, disabled, children, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={["oe-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
    >
      <span className="oe-button__label">{children}</span>
      {loading ? <span className="oe-spinner" role="presentation" /> : null}
    </button>
  );
}

export type IconButtonProps = Omit<ButtonProps, "children" | "aria-label"> & {
  /** UIcons glyph name without the `fi-rr-` prefix, e.g. "cross". */
  icon: string;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
};

export function IconButton({ icon, label, variant = "ghost", ...rest }: IconButtonProps) {
  return (
    <Button {...rest} variant={variant} aria-label={label} className={["oe-button--icon", rest.className].filter(Boolean).join(" ")}>
      <Icon name={icon} />
    </Button>
  );
}
