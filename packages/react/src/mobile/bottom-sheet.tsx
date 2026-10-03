import React, { useRef, useState, useEffect } from "react";
import "./mobile.css";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: BottomSheetProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setCurrentTranslateY(0);
    }
  }, [open]);

  if (!open) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0]?.clientY ?? null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = (e.touches[0]?.clientY ?? 0) - startY;
    if (deltaY > 0) {
      setCurrentTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentTranslateY > 120) {
      onClose();
    } else {
      setCurrentTranslateY(0);
    }
    setStartY(null);
  };

  return (
    <div
      className="oe-bottom-sheet-scrim"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "바텀 시트"}
        className={[
          "oe-bottom-sheet-panel",
          "oe-glass",
          "oe-glass--frosted",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          transform: `translateY(${currentTranslateY}px)`,
          transition: startY === null ? "transform 0.25s ease-out" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="oe-bottom-sheet-handle-bar">
          <div className="oe-bottom-sheet-handle" />
        </div>
        {title && <h3 className="oe-bottom-sheet-title">{title}</h3>}
        <div className="oe-bottom-sheet-content">{children}</div>
      </div>
    </div>
  );
}
