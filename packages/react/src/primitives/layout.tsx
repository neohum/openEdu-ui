import type { CSSProperties, HTMLAttributes } from "react";

export type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type LayoutProps = HTMLAttributes<HTMLDivElement> & { gap?: SpaceStep };

const gapVar = (gap: SpaceStep) => `var(--space-${gap})`;
const cx = (base: string, extra?: string) => [base, extra].filter(Boolean).join(" ");

/** Vertical rhythm: children are grouped by proximity. */
export function Stack({ gap = 4, className, style, ...rest }: LayoutProps) {
  return <div {...rest} className={cx("oe-stack", className)} style={{ gap: gapVar(gap), ...style }} />;
}

/** Horizontal group that wraps. */
export function Cluster({ gap = 3, className, style, ...rest }: LayoutProps) {
  return <div {...rest} className={cx("oe-cluster", className)} style={{ gap: gapVar(gap), ...style }} />;
}

/** Responsive columns, each at least `minColumn` wide. */
export function Grid({ gap = 6, minColumn = "16rem", className, style, ...rest }: LayoutProps & { minColumn?: string }) {
  const vars = { gap: gapVar(gap), "--oe-grid-min": minColumn } as CSSProperties;
  return <div {...rest} className={cx("oe-grid", className)} style={{ ...vars, ...style }} />;
}
