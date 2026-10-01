import { createPointerRouter, type RoutedEvent } from "@openedu/core";
import type { InkEngine } from "./types.ts";

/**
 * Wires pointer input on `host` to the engine. Pen always draws; the mouse
 * draws unless `mouse: false`; fingers draw only with `finger: true` (palm
 * rejection from @openedu/core still applies). Returns a disposer.
 *
 * Sets `touch-action: none` on the host while attached so the browser does not
 * steal pen/finger drags for scrolling; the previous value is restored.
 */
export function attachInkInput(
  engine: InkEngine,
  host: HTMLElement,
  opts: { finger?: boolean; mouse?: boolean } = {},
): () => void {
  const { finger = false, mouse = true } = opts;
  let activeId: number | null = null;
  const previousTouchAction = host.style.touchAction;
  host.style.touchAction = "none";

  const toPoint = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure ?? 0, t: e.timeStamp };
  };

  const finish = (e: PointerEvent) => {
    if (activeId === null || e.pointerId !== activeId) return;
    activeId = null;
    engine.endStroke();
    try {
      if (typeof host.releasePointerCapture === "function") host.releasePointerCapture(e.pointerId);
    } catch {
      /* capture already released */
    }
  };

  const onInk = ({ type, event: e }: RoutedEvent) => {
    if (type === "down") {
      if (activeId !== null) return; // a second pointer must not hijack the stroke
      if (e.pointerType === "mouse" && (e.button ?? 0) !== 0) return;
      activeId = e.pointerId;
      try {
        if (typeof host.setPointerCapture === "function") host.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic or already-released pointer */
      }
      if (typeof e.preventDefault === "function") e.preventDefault();
      engine.beginStroke(toPoint(e));
    } else if (type === "move") {
      if (e.pointerId !== activeId) return;
      const coalesced = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
      for (const c of coalesced.length > 0 ? coalesced : [e]) engine.extendStroke(toPoint(c));
    } else {
      finish(e);
    }
  };

  const disposeRouter = createPointerRouter(host, { onInk }, { mouseInks: mouse, touchInks: finger });

  // The router drops touch "up" events once a palm/pen rejects them; end the
  // stroke ourselves so it can never get stuck open.
  const onEnd = (e: Event) => finish(e as PointerEvent);
  host.addEventListener("pointerup", onEnd);
  host.addEventListener("pointercancel", onEnd);

  return () => {
    disposeRouter();
    host.removeEventListener("pointerup", onEnd);
    host.removeEventListener("pointercancel", onEnd);
    if (activeId !== null) {
      activeId = null;
      engine.endStroke();
    }
    host.style.touchAction = previousTouchAction;
  };
}
