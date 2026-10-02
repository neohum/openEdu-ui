import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "score"
  | "success"
  | "destructive";

export type BadgeSize = "sm" | "md" | "lg";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={["oe-badge", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </span>
  );
}
