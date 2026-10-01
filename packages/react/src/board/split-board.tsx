import { createPointerRouter, type RoutedEvent } from "@openedu/core";
import { useEffect, useRef, type ReactNode } from "react";

export type ZoneCount = 2 | 3 | 4;

export type SplitBoardProps = {
  zones: ZoneCount;
  label: string;
  /** Renders the content of one zone (0-based). */
  renderZone: (index: number) => ReactNode;
  /** Optional per-zone footer, e.g. a submit button or timer. */
  renderFooter?: (index: number) => ReactNode;
  zoneLabel?: (index: number) => string;
  onInk?: (zone: number, e: RoutedEvent) => void;
  onUi?: (zone: number, e: RoutedEvent) => void;
};

function Zone({ index, label, onInk, onUi, children, footer }: {
  index: number;
  label: string;
  onInk?: SplitBoardProps["onInk"];
  onUi?: SplitBoardProps["onUi"];
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const handlers = useRef({ onInk, onUi });
  handlers.current = { onInk, onUi };

  // Routing is per zone so simultaneous students never interfere with each other.
  useEffect(() => {
    if (!ref.current) return;
    return createPointerRouter(ref.current, {
      onInk: (e) => handlers.current.onInk?.(index, e),
      onUi: (e) => handlers.current.onUi?.(index, e),
    });
  }, [index]);

  return (
    <section ref={ref} className="oe-zone" aria-label={label} data-zone={index}>
      <div className="oe-zone__body">{children}</div>
      {footer ? <footer className="oe-zone__footer">{footer}</footer> : null}
    </section>
  );
}

export function SplitBoard({ zones, label, renderZone, renderFooter, zoneLabel = (i) => `영역 ${i + 1}`, onInk, onUi }: SplitBoardProps) {
  return (
    <div role="group" aria-label={label} className="oe-split" data-zones={zones}>
      {Array.from({ length: zones }, (_, i) => (
        <Zone key={i} index={i} label={zoneLabel(i)} onInk={onInk} onUi={onUi} footer={renderFooter?.(i)}>
          {renderZone(i)}
        </Zone>
      ))}
    </div>
  );
}
