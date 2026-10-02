import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { attachInkInput, createInkEngine, type InkEngine, type InkOptions, type InkState } from "@openedu/ink";
import {
  InkToolbar,
  inkColorToken,
  type InkColorId,
  type InkLabelKey,
  type InkToolId,
} from "./ink-toolbar.tsx";

const FALLBACK_INK_COLORS: Record<InkColorId, string> = {
  1: "#1e293b", // lint-ignore
  2: "#2563eb", // lint-ignore
  3: "#dc2626", // lint-ignore
  4: "#15803d", // lint-ignore
  5: "#c2410c", // lint-ignore
  6: "#7e22ce", // lint-ignore
};

export function resolveInkColor(el: HTMLElement | null, id: InkColorId): string {
  if (typeof window !== "undefined" && el) {
    const val = window.getComputedStyle(el).getPropertyValue(inkColorToken(id)).trim();
    if (val) return val;
  }
  return FALLBACK_INK_COLORS[id] ?? "#1e293b"; // lint-ignore
}

export type InkCanvasProps = HTMLAttributes<HTMLDivElement> & {
  engine: InkEngine;
  finger?: boolean;
  mouse?: boolean;
  readOnly?: boolean;
  label?: string;
};

/** Canvas host container that binds the drawing engine and pointer input router. */
export const InkCanvas = forwardRef<HTMLDivElement, InkCanvasProps>(function InkCanvas(
  { engine, finger = false, mouse = true, readOnly = false, label = "판서 캔버스", className = "", style, ...rest },
  forwardedRef,
) {
  const localRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    engine.attach(el);
    const disposeInput = !readOnly ? attachInkInput(engine, el, { finger, mouse }) : () => {};

    return () => {
      disposeInput();
      engine.detach();
    };
  }, [engine, finger, mouse, readOnly]);

  const classes = ["oe-ink-board__canvas-area", className].filter(Boolean).join(" ");

  return (
    <div
      ref={localRef}
      role="region"
      aria-label={label}
      tabIndex={readOnly ? -1 : 0}
      className={classes}
      style={style}
      {...rest}
    />
  );
});

export type InkBoardHandle = {
  readonly engine: InkEngine;
  toBlob(type?: "image/png"): Promise<Blob>;
  clear(): void;
  undo(): void;
  redo(): void;
  getState(): InkState;
  load(state: InkState): void;
};

export type InkBoardProps = {
  label?: string;
  canvasLabel?: string;
  engine?: InkEngine;
  engineOptions?: InkOptions;
  value?: InkState;
  defaultValue?: InkState;
  onChange?: (state: InkState) => void;
  toolbarPlacement?: "top" | "bottom" | "none";
  finger?: boolean;
  mouse?: boolean;
  readOnly?: boolean;
  defaultTool?: InkToolId;
  defaultColor?: InkColorId;
  defaultSize?: number;
  sizes?: number[];
  toolbarLabels?: Partial<Record<InkLabelKey, string>>;
  onExport?: (blob: Blob) => void;
  exportFilename?: string;
  className?: string;
  style?: CSSProperties;
};

/** All-in-one chalkboard drawing board combining canvas and toolbar. */
export const InkBoard = forwardRef<InkBoardHandle, InkBoardProps>(function InkBoard(
  {
    label = "전자칠판 판서",
    canvasLabel = "판서 캔버스",
    engine: externalEngine,
    engineOptions,
    value,
    defaultValue,
    onChange,
    toolbarPlacement = "bottom",
    finger = false,
    mouse = true,
    readOnly = false,
    defaultTool = "pen",
    defaultColor = 1,
    defaultSize = 4,
    sizes,
    toolbarLabels,
    onExport,
    exportFilename = "openedu-drawing.png",
    className = "",
    style,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Maintain internal engine if not provided externally
  const [internalEngine] = useState(() => {
    return (
      externalEngine ??
      createInkEngine({
        ...engineOptions,
        onChange: (s) => {
          engineOptions?.onChange?.(s);
          onChangeRef.current?.(s);
        },
      })
    );
  });
  const engine = externalEngine ?? internalEngine;

  const [tool, setTool] = useState<InkToolId>(defaultTool);
  const [colorId, setColorId] = useState<InkColorId>(defaultColor);
  const [size, setSize] = useState<number>(defaultSize);
  const [canUndo, setCanUndo] = useState(() => engine.canUndo());
  const [canRedo, setCanRedo] = useState(() => engine.canRedo());

  // Apply default state once if provided
  const initialLoaded = useRef(false);
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    const initial = value ?? defaultValue;
    if (initial) engine.load(initial);
  }, [engine, value, defaultValue]);

  // Synchronize controlled value
  useEffect(() => {
    if (value && initialLoaded.current) {
      engine.load(value);
    }
  }, [engine, value]);

  // Sync color resolution from CSS token
  const updateEngineColor = useCallback(
    (cId: InkColorId) => {
      const resolved = resolveInkColor(containerRef.current, cId);
      engine.setColor(resolved);
    },
    [engine],
  );

  useEffect(() => {
    engine.setTool(tool);
  }, [engine, tool]);

  useEffect(() => {
    updateEngineColor(colorId);
  }, [colorId, updateEngineColor]);

  useEffect(() => {
    engine.setSize(size);
  }, [engine, size]);

  // Track undo/redo readiness and changes (especially for externally passed engine)
  const lastSerializedState = useRef<string>("");
  useEffect(() => {
    lastSerializedState.current = JSON.stringify(engine.getState());
    const unsub = engine.subscribe(() => {
      setCanUndo(engine.canUndo());
      setCanRedo(engine.canRedo());

      if (externalEngine) {
        const nextState = engine.getState();
        const serialized = JSON.stringify(nextState);
        if (serialized !== lastSerializedState.current) {
          lastSerializedState.current = serialized;
          onChangeRef.current?.(nextState);
        }
      }
    });
    return unsub;
  }, [engine, externalEngine]);

  // Re-resolve color when theme changes
  useEffect(() => {
    if (typeof window === "undefined" || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      updateEngineColor(colorId);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    return () => observer.disconnect();
  }, [colorId, updateEngineColor]);

  useImperativeHandle(
    ref,
    () => ({
      get engine() {
        return engine;
      },
      toBlob: (t) => engine.toBlob(t),
      clear: () => engine.clear(),
      undo: () => engine.undo(),
      redo: () => engine.redo(),
      getState: () => engine.getState(),
      load: (st) => engine.load(st),
    }),
    [engine],
  );

  const handleToolChange = (next: InkToolId) => {
    setTool(next);
  };

  const handleColorChange = (next: InkColorId) => {
    setColorId(next);
  };

  const handleSizeChange = (next: number) => {
    setSize(next);
  };

  const handleExport = useCallback(async () => {
    try {
      const blob = await engine.toBlob("image/png");
      onExport?.(blob);
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        const createUrl =
          (typeof window !== "undefined" && typeof window.URL?.createObjectURL === "function" && window.URL.createObjectURL.bind(window.URL)) ||
          (typeof URL !== "undefined" && typeof URL.createObjectURL === "function" && URL.createObjectURL.bind(URL)) ||
          null;
        const revokeUrl =
          (typeof window !== "undefined" && typeof window.URL?.revokeObjectURL === "function" && window.URL.revokeObjectURL.bind(window.URL)) ||
          (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function" && URL.revokeObjectURL.bind(URL)) ||
          null;
        if (createUrl) {
          const url = createUrl(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = exportFilename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          revokeUrl?.(url);
        }
      }
    } catch {
      // Gracefully ignore export failures (e.g. headless without canvas)
    }
  }, [engine, exportFilename, onExport]);

  const boardClasses = [
    "oe-ink-board",
    readOnly ? "oe-ink-board--readonly" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showToolbar = toolbarPlacement !== "none" && !readOnly;

  const renderToolbar = (placement: "top" | "bottom") => (
    <div
      className={`oe-ink-board__toolbar-container ${
        placement === "top" ? "oe-ink-board__toolbar-container--top" : ""
      }`}
    >
      <InkToolbar
        tool={tool}
        onToolChange={handleToolChange}
        color={colorId}
        onColorChange={handleColorChange}
        size={size}
        onSizeChange={handleSizeChange}
        sizes={sizes}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => engine.undo()}
        onRedo={() => engine.redo()}
        onClear={() => engine.clear()}
        onExport={handleExport}
        labels={toolbarLabels}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={boardClasses}
      style={style}
      role="group"
      aria-label={label}
    >
      {showToolbar && toolbarPlacement === "top" ? renderToolbar("top") : null}
      <InkCanvas
        engine={engine}
        finger={finger}
        mouse={mouse}
        readOnly={readOnly}
        label={canvasLabel}
      />
      {showToolbar && toolbarPlacement === "bottom" ? renderToolbar("bottom") : null}
    </div>
  );
});
