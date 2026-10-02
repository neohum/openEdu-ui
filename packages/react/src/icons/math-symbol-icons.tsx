import React, { forwardRef } from "react";

export type MathSymbolSize = "sm" | "md" | "lg" | number;

export interface MathSymbolBaseProps extends React.SVGAttributes<SVGSVGElement> {
  size?: MathSymbolSize;
  className?: string;
  color?: string;
  ariaLabel?: string;
  strokeWidth?: number;
}

export function resolveMathIconSize(size: MathSymbolSize = "md"): number {
  if (typeof size === "number") return size;
  switch (size) {
    case "sm":
      return 16;
    case "lg":
      return 32;
    case "md":
    default:
      return 24;
  }
}

function createIcon(
  displayName: string,
  symbolName: string,
  renderPaths: (strokeColor: string, strokeW: number) => React.ReactNode,
) {
  const Component = forwardRef<SVGSVGElement, MathSymbolBaseProps>(
    ({ size = "md", className, color, ariaLabel, strokeWidth = 2, style, ...rest }, ref) => {
      const dimension = resolveMathIconSize(size);
      const strokeColor = color ?? "currentColor";
      const isAccessible = Boolean(ariaLabel || rest["aria-label"]);

      return (
        <svg
          ref={ref}
          width={dimension}
          height={dimension}
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={["oe-math-symbol-icon", className].filter(Boolean).join(" ")}
          data-symbol={symbolName}
          data-size={typeof size === "string" ? size : undefined}
          role={isAccessible ? "img" : undefined}
          aria-label={ariaLabel || rest["aria-label"]}
          aria-hidden={isAccessible ? undefined : "true"}
          style={style}
          {...rest}
        >
          {renderPaths(strokeColor, strokeWidth)}
        </svg>
      );
    },
  );

  Component.displayName = displayName;
  return Component;
}

// 1. Fraction (\frac{a}{b})
export const FractionIcon = createIcon("FractionIcon", "fraction", (_c, _w) => (
  <>
    <line x1="4" y1="12" x2="20" y2="12" />
    <rect x="7" y="4" width="10" height="5.5" rx="1.5" />
    <rect x="7" y="14.5" width="10" height="5.5" rx="1.5" />
  </>
));

// 2. Sqrt (\sqrt{x})
export const SqrtIcon = createIcon("SqrtIcon", "sqrt", () => (
  <>
    <path d="M3 14.5h2.5l2.5 6.5 3.5-16H21" />
    <path d="M14.5 11.5l4 5 M18.5 11.5l-4 5" />
  </>
));

// 3. Superscript (x^n)
export const SuperscriptIcon = createIcon("SuperscriptIcon", "superscript", () => (
  <>
    <path d="M4 10l6 8 M10 10l-6 8" />
    <path d="M15 10V6.5a1.5 1.5 0 0 1 3 0V10" />
  </>
));

// 4. Subscript (x_n)
export const SubscriptIcon = createIcon("SubscriptIcon", "subscript", () => (
  <>
    <path d="M4 6l6 8 M10 6l-6 8" />
    <path d="M15 19v-3.5a1.5 1.5 0 0 1 3 0V19" />
  </>
));

// 5. Parentheses (())
export const ParenthesesIcon = createIcon("ParenthesesIcon", "parentheses", () => (
  <>
    <path d="M8 4.5C5.5 8 5.5 16 8 19.5" />
    <path d="M16 4.5c2.5 3.5 2.5 11.5 0 15" />
  </>
));

// 6. Brackets ([])
export const BracketsIcon = createIcon("BracketsIcon", "brackets", () => (
  <>
    <path d="M9 4.5H6v15h3" />
    <path d="M15 4.5h3v15h-3" />
  </>
));

// 7. CurlyBraces ({})
export const CurlyBracesIcon = createIcon("CurlyBracesIcon", "curlyBraces", () => (
  <>
    <path d="M9 4.5H7.5A2.5 2.5 0 0 0 5 7v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 2.5 2.5H9" />
    <path d="M15 4.5h1.5A2.5 2.5 0 0 1 19 7v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2.5 2.5 0 0 1-2.5 2.5H15" />
  </>
));

// 8. Integral (\int)
export const IntegralIcon = createIcon("IntegralIcon", "integral", () => (
  <path d="M16 4.5c-2 0-3.5 1.5-3.5 3.5v8c0 2-1.5 3.5-3.5 3.5-1.5 0-2.5-1-2.5-2.5" />
));

// 9. Sigma (\sum)
export const SigmaIcon = createIcon("SigmaIcon", "sigma", () => (
  <path d="M18 4.5H6l7 7.5-7 7.5h12" />
));

// 10. Infinity (\infty)
export const InfinityIcon = createIcon("InfinityIcon", "infinity", () => (
  <path d="M12 12c-2.5-3.5-5-3.5-7.5-1.5a4 4 0 0 0 0 6c2.5 2 5 2 7.5-1.5 2.5 3.5 5 3.5 7.5 1.5a4 4 0 0 0 0-6c-2.5-2-5-2-7.5 1.5z" />
));

// 11. Pi (\pi)
export const PiIcon = createIcon("PiIcon", "pi", () => (
  <>
    <line x1="4" y1="7" x2="20" y2="7" />
    <path d="M8 7v10c0 1.5-1 2.5-2 2.5" />
    <path d="M16 7v10.5c0 1.5 1 2 2 2" />
  </>
));

// 12. Trig (\sin)
export const TrigIcon = createIcon("TrigIcon", "trig", () => (
  <>
    <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" opacity="0.6" />
    <path d="M3 12c2.5-8 5-8 7.5 0s5 8 7.5 0 2-4 3-4" />
  </>
));

// 13. Angle (\angle)
export const AngleIcon = createIcon("AngleIcon", "angle", () => (
  <>
    <path d="M20 19H5L17 6" />
    <path d="M11 19a6 6 0 0 0-2.7-4.8" />
  </>
));

// 14. Triangle (\triangle)
export const TriangleIcon = createIcon("TriangleIcon", "triangle", () => (
  <polygon points="12,4.5 20.5,19.5 3.5,19.5" />
));

// 15. Square (\square)
export const SquareIcon = createIcon("SquareIcon", "square", () => (
  <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
));

// 16. Circle (\bigcirc)
export const CircleIcon = createIcon("CircleIcon", "circle", () => (
  <circle cx="12" cy="12" r="8" />
));

// 17. Parallel (\parallel)
export const ParallelIcon = createIcon("ParallelIcon", "parallel", () => (
  <>
    <line x1="8" y1="20" x2="12" y2="4" />
    <line x1="13" y1="20" x2="17" y2="4" />
  </>
));

// 18. Perpendicular (\perp)
export const PerpendicularIcon = createIcon("PerpendicularIcon", "perpendicular", () => (
  <>
    <line x1="4" y1="19" x2="20" y2="19" />
    <line x1="12" y1="19" x2="12" y2="5" />
    <path d="M12 15h4v4" />
  </>
));

// 19. PlusMinus (\pm)
export const PlusMinusIcon = createIcon("PlusMinusIcon", "plusMinus", () => (
  <>
    <line x1="12" y1="4" x2="12" y2="12" />
    <line x1="7" y1="8" x2="17" y2="8" />
    <line x1="7" y1="18" x2="17" y2="18" />
  </>
));

// 20. Divide (\div)
export const DivideIcon = createIcon("DivideIcon", "divide", (color) => (
  <>
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="12" cy="6.5" r="1.75" fill={color} stroke="none" />
    <circle cx="12" cy="17.5" r="1.75" fill={color} stroke="none" />
  </>
));

export type MathSymbolName =
  | "fraction"
  | "sqrt"
  | "superscript"
  | "subscript"
  | "parentheses"
  | "brackets"
  | "curlyBraces"
  | "integral"
  | "sigma"
  | "infinity"
  | "pi"
  | "trig"
  | "angle"
  | "triangle"
  | "square"
  | "circle"
  | "parallel"
  | "perpendicular"
  | "plusMinus"
  | "divide";

export type MathSymbolComponent = React.ForwardRefExoticComponent<
  MathSymbolBaseProps & React.RefAttributes<SVGSVGElement>
>;

export const MATH_SYMBOL_COMPONENTS: Record<MathSymbolName, MathSymbolComponent> = {
  fraction: FractionIcon,
  sqrt: SqrtIcon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
  parentheses: ParenthesesIcon,
  brackets: BracketsIcon,
  curlyBraces: CurlyBracesIcon,
  integral: IntegralIcon,
  sigma: SigmaIcon,
  infinity: InfinityIcon,
  pi: PiIcon,
  trig: TrigIcon,
  angle: AngleIcon,
  triangle: TriangleIcon,
  square: SquareIcon,
  circle: CircleIcon,
  parallel: ParallelIcon,
  perpendicular: PerpendicularIcon,
  plusMinus: PlusMinusIcon,
  divide: DivideIcon,
};

export interface MathSymbolIconProps extends MathSymbolBaseProps {
  name: MathSymbolName;
}

export type MathSymbolCompound = React.ForwardRefExoticComponent<
  MathSymbolIconProps & React.RefAttributes<SVGSVGElement>
> & {
  Fraction: typeof FractionIcon;
  Sqrt: typeof SqrtIcon;
  Superscript: typeof SuperscriptIcon;
  Subscript: typeof SubscriptIcon;
  Parentheses: typeof ParenthesesIcon;
  Brackets: typeof BracketsIcon;
  CurlyBraces: typeof CurlyBracesIcon;
  Integral: typeof IntegralIcon;
  Sigma: typeof SigmaIcon;
  Infinity: typeof InfinityIcon;
  Pi: typeof PiIcon;
  Trig: typeof TrigIcon;
  Angle: typeof AngleIcon;
  Triangle: typeof TriangleIcon;
  Square: typeof SquareIcon;
  Circle: typeof CircleIcon;
  Parallel: typeof ParallelIcon;
  Perpendicular: typeof PerpendicularIcon;
  PlusMinus: typeof PlusMinusIcon;
  Divide: typeof DivideIcon;
};

const MathSymbolIconRoot = forwardRef<SVGSVGElement, MathSymbolIconProps>(({ name, ...props }, ref) => {
  const Component = MATH_SYMBOL_COMPONENTS[name];
  if (!Component) {
    return null;
  }
  return <Component ref={ref} {...props} />;
});

MathSymbolIconRoot.displayName = "MathSymbolIcon";

export const MathSymbolIcon = Object.assign(MathSymbolIconRoot, {
  Fraction: FractionIcon,
  Sqrt: SqrtIcon,
  Superscript: SuperscriptIcon,
  Subscript: SubscriptIcon,
  Parentheses: ParenthesesIcon,
  Brackets: BracketsIcon,
  CurlyBraces: CurlyBracesIcon,
  Integral: IntegralIcon,
  Sigma: SigmaIcon,
  Infinity: InfinityIcon,
  Pi: PiIcon,
  Trig: TrigIcon,
  Angle: AngleIcon,
  Triangle: TriangleIcon,
  Square: SquareIcon,
  Circle: CircleIcon,
  Parallel: ParallelIcon,
  Perpendicular: PerpendicularIcon,
  PlusMinus: PlusMinusIcon,
  Divide: DivideIcon,
}) as MathSymbolCompound;
