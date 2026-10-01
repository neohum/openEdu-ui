import { useEffect, type CSSProperties } from "react";
import { Icon } from "../primitives/icon.tsx";

export type RadialItem = { id: string; label: string; icon: string };
type Point = { x: number; y: number };

/**
 * Item centers on a circle around `origin`, spread over the arc that stays on screen.
 * Items are first placed over a full circle and then each is clamped inside the viewport.
 */
export function radialPositions(count: number, radius: number, origin: Point, viewport: { width: number; height: number }, margin = 0): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
    const x = origin.x + radius * Math.cos(angle);
    const y = origin.y + radius * Math.sin(angle);
    return {
      x: Math.min(viewport.width - margin, Math.max(margin, x)),
      y: Math.min(viewport.height - margin, Math.max(margin, y)),
    };
  });
}

export type RadialMenuProps = {
  open: boolean;
  /** Where the touch happened (viewport coordinates). */
  origin: Point;
  items: RadialItem[];
  label: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  radius?: number;
  viewport?: { width: number; height: number };
};

export function RadialMenu({ open, origin, items, label, onSelect, onClose, radius = 128, viewport }: RadialMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const vp = viewport ?? { width: window.innerWidth, height: window.innerHeight };
  const positions = radialPositions(items.length, radius, origin, vp, 40);

  return (
    <div className="oe-radial" role="presentation" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="menu" aria-label={label} className="oe-radial__menu">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            aria-label={item.label}
            className="oe-radial__item"
            style={{ "--oe-x": `${positions[i]!.x}px`, "--oe-y": `${positions[i]!.y}px` } as CSSProperties}
            onClick={() => {
              onSelect(item.id);
              onClose();
            }}
          >
            <Icon name={item.icon} />
          </button>
        ))}
      </div>
    </div>
  );
}
