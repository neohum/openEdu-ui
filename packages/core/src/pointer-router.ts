export type PointerRoute = "ink" | "ui" | "ignore";

export type PointerLike = {
  pointerType: string;
  width: number;
  height: number;
};

export type RouteOptions = {
  /** Touch contacts larger than this (CSS px, either axis) are treated as a resting palm. */
  palmThreshold?: number;
  /** Let a mouse draw instead of operating the UI (useful for desktop whiteboards). */
  mouseInks?: boolean;
  /** Let a finger draw (after palm rejection) instead of operating the UI. Default false. */
  touchInks?: boolean;
  /** A pen is currently touching the surface, so any touch is a resting hand. */
  penActive?: boolean;
};

export const DEFAULT_PALM_THRESHOLD = 40;

export function classifyPointer(p: PointerLike, opts: RouteOptions = {}): PointerRoute {
  const palm = opts.palmThreshold ?? DEFAULT_PALM_THRESHOLD;
  if (p.pointerType === "pen") return "ink";
  if (p.pointerType === "touch") {
    if (opts.penActive) return "ignore";
    if (Math.max(p.width, p.height) > palm) return "ignore";
    return opts.touchInks ? "ink" : "ui";
  }
  return opts.mouseInks ? "ink" : "ui";
}

export type RoutedEvent = { route: Exclude<PointerRoute, "ignore">; type: "down" | "move" | "up"; event: PointerEvent };

export type RouterHandlers = {
  onInk?: (e: RoutedEvent) => void;
  onUi?: (e: RoutedEvent) => void;
};

const TYPES = { pointerdown: "down", pointermove: "move", pointerup: "up", pointercancel: "up" } as const;

/** Routes pointer events by input source. Returns a disposer. */
export function createPointerRouter(
  target: EventTarget,
  handlers: RouterHandlers,
  options: Omit<RouteOptions, "penActive"> = {},
): () => void {
  const penDown = new Set<number>();
  const listeners = Object.entries(TYPES).map(([name, type]) => {
    const listener = (raw: Event) => {
      const e = raw as PointerEvent;
      if (e.pointerType === "pen") {
        if (type === "down") penDown.add(e.pointerId);
        if (type === "up") penDown.delete(e.pointerId);
      }
      const route = classifyPointer(e, { ...options, penActive: penDown.size > 0 });
      if (route === "ignore") return;
      (route === "ink" ? handlers.onInk : handlers.onUi)?.({ route, type, event: e });
    };
    target.addEventListener(name, listener);
    return [name, listener] as const;
  });
  return () => listeners.forEach(([name, l]) => target.removeEventListener(name, l));
}
