import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={["oe-card", className].filter(Boolean).join(" ")} />;
}
