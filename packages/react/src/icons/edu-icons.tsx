import React, { forwardRef } from "react";

export type EduClassroomIconName =
  | "clock"
  | "timer"
  | "bell"
  | "trophy"
  | "bullhorn"
  | "users"
  | "dice"
  | "refresh";

export type EduWritingIconName =
  | "pencil"
  | "highlighter"
  | "eraser"
  | "brush"
  | "ruler"
  | "compass"
  | "shapes"
  | "cube";

export type EduEvaluationIconName =
  | "print"
  | "scissors"
  | "stamp"
  | "check"
  | "cross"
  | "document"
  | "star";

export type EduIconName =
  | EduClassroomIconName
  | EduWritingIconName
  | EduEvaluationIconName
  | (string & {});

export const EDU_ICON_CATEGORIES = {
  management: [
    "clock",
    "timer",
    "bell",
    "trophy",
    "bullhorn",
    "users",
    "dice",
    "refresh",
  ] as const,
  writing: [
    "pencil",
    "highlighter",
    "eraser",
    "brush",
    "ruler",
    "compass",
    "shapes",
    "cube",
  ] as const,
  evaluation: [
    "print",
    "scissors",
    "stamp",
    "check",
    "cross",
    "document",
    "star",
  ] as const,
} as const;

export const EDU_ICON_MAP: Record<string, string> = {
  // 수업 관리 (Classroom Management)
  clock: "fi-rr-clock",
  timer: "fi-rr-timer",
  bell: "fi-rr-bell",
  trophy: "fi-rr-trophy",
  bullhorn: "fi-rr-bullhorn",
  users: "fi-rr-users",
  dice: "fi-rr-dice",
  refresh: "fi-rr-refresh",

  // 필기/교구 (Writing & Manipulatives)
  pencil: "fi-rr-pencil",
  highlighter: "fi-rr-highlighter",
  eraser: "fi-rr-eraser",
  brush: "fi-rr-brush",
  ruler: "fi-rr-ruler",
  compass: "fi-rr-compass",
  shapes: "fi-rr-shapes",
  cube: "fi-rr-cube",

  // 평가/인쇄 (Assessment & Print)
  print: "fi-rr-print",
  scissors: "fi-rr-scissors",
  stamp: "fi-rr-stamp",
  check: "fi-rr-check",
  cross: "fi-rr-cross",
  document: "fi-rr-document",
  star: "fi-rr-star",
};

export function resolveEduIconGlyph(name: string): string {
  if (EDU_ICON_MAP[name]) {
    return EDU_ICON_MAP[name];
  }
  if (name.startsWith("fi-rr-") || name.startsWith("fi-")) {
    return name;
  }
  return `fi-rr-${name}`;
}

export type EduIconSize = "sm" | "md" | "lg" | number;

export interface EduIconProps extends React.HTMLAttributes<HTMLElement> {
  name: EduIconName;
  size?: EduIconSize;
  className?: string;
  ariaLabel?: string;
  color?: string;
}

export const EduIcon = forwardRef<HTMLElement, EduIconProps>(
  ({ name, size = "md", className, ariaLabel, color, style, ...rest }, ref) => {
    const glyph = resolveEduIconGlyph(name);
    const isAccessible = Boolean(ariaLabel || rest["aria-label"]);

    const customStyles: React.CSSProperties = {
      ...(typeof size === "number" ? ({ "--oe-icon-size": `${size}px` } as React.CSSProperties) : {}),
      ...(color ? { color } : {}),
      ...style,
    };

    return (
      <i
        ref={ref}
        className={["fi", glyph, "oe-edu-icon", className].filter(Boolean).join(" ")}
        data-name={name}
        data-size={typeof size === "string" ? size : undefined}
        role={isAccessible ? "img" : undefined}
        aria-label={ariaLabel || rest["aria-label"]}
        aria-hidden={isAccessible ? undefined : "true"}
        style={customStyles}
        {...rest}
      />
    );
  },
);

EduIcon.displayName = "EduIcon";
