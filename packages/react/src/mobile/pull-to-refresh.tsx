import React, { useRef, useState } from "react";
import "./mobile.css";

export interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 60,
  className = "",
}: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0]?.clientY ?? null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null || refreshing) return;
    const currentY = e.touches[0]?.clientY ?? 0;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      // Apply friction
      setPullY(Math.min(diff * 0.45, 90));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= threshold && !refreshing) {
      setRefreshing(true);
      setPullY(44);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
    startYRef.current = null;
  };

  return (
    <div
      className={["oe-pull-to-refresh-container", className].filter(Boolean).join(" ")}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="oe-pull-indicator"
        style={{
          transform: `translate(-50%, ${pullY - 44}px)`,
          opacity: pullY > 10 ? 1 : 0,
        }}
        role="status"
        aria-live="polite"
      >
        <span
          className={[
            "oe-pull-dial",
            refreshing ? "oe-pull-dial--spinning" : "",
          ].join(" ")}
          style={{ transform: `rotate(${pullY * 3.6}deg)` }}
        >
          🔄
        </span>
      </div>
      <div className="oe-pull-content">{children}</div>
    </div>
  );
}
