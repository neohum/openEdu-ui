import React, { useRef, useState, type HTMLAttributes } from "react";
import "./mobile.css";

export interface DragScrollerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DragScroller({
  className = "",
  children,
  ...props
}: DragScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollerRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollerRef.current.offsetLeft);
    setScrollLeft(scrollerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    scrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollerRef}
      className={[
        "oe-drag-scroller",
        isDown ? "oe-drag-scroller--active" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div className="oe-drag-scroller__track">{children}</div>
    </div>
  );
}
