import React, { useEffect, useRef, type HTMLAttributes } from "react";
import "./sheet.css";

export type SheetSide = "top" | "right" | "bottom" | "left";

export interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  side?: SheetSide;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  description,
  className = "",
  children,
  ...props
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="oe-sheet-scrim" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className={["oe-sheet-panel", `oe-sheet-panel--${side}`, className]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="oe-sheet-header">
          {title && <h3 className="oe-sheet-title">{title}</h3>}
          {description && <p className="oe-sheet-desc">{description}</p>}
          <button
            type="button"
            className="oe-sheet-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="oe-sheet-body">{children}</div>
      </div>
    </div>
  );
}
