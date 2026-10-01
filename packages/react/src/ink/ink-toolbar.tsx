import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Button, IconButton } from "../primitives/button.tsx";
import { Icon } from "../primitives/icon.tsx";

export type InkToolId = "pen" | "highlighter" | "eraser";
export type InkColorId = 1 | 2 | 3 | 4 | 5 | 6;

export type InkLabelKey =
  | "pen"
  | "highlighter"
  | "eraser"
  | "undo"
  | "redo"
  | "clear"
  | "color"
  | "size"
  | "clearConfirm"
  | "tools"
  | "actions";

export type InkToolbarProps = {
  label?: string;
  tool: InkToolId;
  onToolChange(tool: InkToolId): void;
  color: InkColorId;
  onColorChange(color: InkColorId): void;
  size: number;
  onSizeChange(size: number): void;
  sizes?: number[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo(): void;
  onRedo(): void;
  onClear(): void;
  labels?: Partial<Record<InkLabelKey, string>>;
};

const DEFAULT_LABELS: Record<InkLabelKey, string> = {
  pen: "펜",
  highlighter: "형광펜",
  eraser: "지우개",
  undo: "되돌리기",
  redo: "다시 실행",
  clear: "모두 지우기",
  color: "색상",
  size: "굵기",
  clearConfirm: "정말 지울까요?",
  tools: "도구",
  actions: "작업",
};

const TOOLS: { id: InkToolId; icon: string }[] = [
  { id: "pen", icon: "pencil-simple" },
  { id: "highlighter", icon: "highlighter" },
  { id: "eraser", icon: "eraser" },
];

const COLORS: InkColorId[] = [1, 2, 3, 4, 5, 6];
const DEFAULT_SIZES = [2, 4, 8, 14];
export const CLEAR_CONFIRM_MS = 3000;

/** Name of the CSS custom property holding the pen color, e.g. `--ink-3`. Resolve it with getComputedStyle for canvas drawing. */
export function inkColorToken(id: InkColorId): string {
  return `--ink-${id}`;
}

/** Radiogroup with roving tabindex: arrows move and select, wrapping at both ends. */
function useRadioKeys<T>(values: readonly T[], current: T, onSelect: (value: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const first = e.key === "Home";
    const last = e.key === "End";
    if (!step && !first && !last) return;
    e.preventDefault();
    const at = Math.max(0, values.indexOf(current));
    const next = first ? 0 : last ? values.length - 1 : (at + step + values.length) % values.length;
    onSelect(values[next]!);
    refs.current[next]?.focus();
  };
  const itemProps = (index: number, value: T) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[index] = el;
    },
    role: "radio" as const,
    "aria-checked": value === current,
    // fall back to the first item so the group stays reachable by Tab when `current` is not in the list
    tabIndex: value === current || (!values.includes(current) && index === 0) ? 0 : -1,
    onClick: () => onSelect(value),
  });
  return { onKeyDown, itemProps };
}

/** Controlled whiteboard drawing toolbar. Presentational only: no drawing engine, no surface logic. */
export function InkToolbar({
  label = "판서 도구",
  tool,
  onToolChange,
  color,
  onColorChange,
  size,
  onSizeChange,
  sizes = DEFAULT_SIZES,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  labels: labelOverrides,
}: InkToolbarProps) {
  const t = { ...DEFAULT_LABELS, ...labelOverrides };
  const colorKeys = useRadioKeys(COLORS, color, onColorChange);
  const sizeKeys = useRadioKeys(sizes, size, onSizeChange);

  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CLEAR_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const pressClear = () => {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    onClear();
  };

  return (
    <div role="toolbar" aria-label={label} className="oe-ink">
      <div role="group" aria-label={t.tools} className="oe-ink__group">
        {TOOLS.map(({ id, icon }) => (
          <IconButton
            key={id}
            icon={icon}
            label={t[id]}
            variant={tool === id ? "secondary" : "ghost"}
            aria-pressed={tool === id}
            className="oe-ink__tool"
            onClick={() => onToolChange(id)}
          />
        ))}
      </div>

      {tool !== "eraser" ? (
        <div role="radiogroup" aria-label={t.color} className="oe-ink__group" onKeyDown={colorKeys.onKeyDown}>
          {COLORS.map((id, i) => (
            <button
              key={id}
              type="button"
              {...colorKeys.itemProps(i, id)}
              aria-label={`${t.color} ${id}`}
              className="oe-ink__swatch"
              data-ink={id}
            />
          ))}
        </div>
      ) : null}

      <div role="radiogroup" aria-label={t.size} className="oe-ink__group" onKeyDown={sizeKeys.onKeyDown}>
        {sizes.map((value, i) => (
          <button
            key={value}
            type="button"
            {...sizeKeys.itemProps(i, value)}
            aria-label={`${t.size} ${value}`}
            className="oe-ink__size"
            style={{ "--oe-ink-dot": `${value}px` } as CSSProperties}
          >
            <span className="oe-ink__dot" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div role="group" aria-label={t.actions} className="oe-ink__group">
        <IconButton icon="arrow-u-up-left" label={t.undo} disabled={!canUndo} onClick={onUndo} />
        <IconButton icon="arrow-u-up-right" label={t.redo} disabled={!canRedo} onClick={onRedo} />
        {confirming ? (
          <Button variant="danger" className="oe-ink__clear" onClick={pressClear}>
            <Icon name="trash" />
            {t.clearConfirm}
          </Button>
        ) : (
          <IconButton icon="trash" label={t.clear} className="oe-ink__clear" onClick={pressClear} />
        )}
      </div>
      <span role="status" aria-live="polite" className="oe-ink__live">
        {confirming ? t.clearConfirm : ""}
      </span>
    </div>
  );
}
