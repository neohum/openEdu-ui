import { useRef } from "react";
import { useControllable } from "./use-controllable.ts";

export type Range = { start: number; end: number };

/** Merges overlapping or touching ranges and sorts them. */
export function mergeRanges(ranges: Range[]): Range[] {
  const sorted = ranges.filter((r) => r.end > r.start).sort((a, b) => a.start - b.start);
  const out: Range[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else out.push({ ...r });
  }
  return out;
}

export type Segment = { text: string; highlighted: boolean; range?: Range };

export function segments(text: string, ranges: Range[]): Segment[] {
  const out: Segment[] = [];
  let at = 0;
  for (const r of mergeRanges(ranges)) {
    const start = Math.min(r.start, text.length);
    const end = Math.min(r.end, text.length);
    if (start > at) out.push({ text: text.slice(at, start), highlighted: false });
    if (end > start) out.push({ text: text.slice(start, end), highlighted: true, range: { start, end } });
    at = Math.max(at, end);
  }
  if (at < text.length) out.push({ text: text.slice(at), highlighted: false });
  return out;
}

export type AnnotatableTextProps = {
  text: string;
  highlights?: Range[];
  defaultHighlights?: Range[];
  onHighlightsChange?: (ranges: Range[]) => void;
  label?: string;
};

/** Select text to highlight it; tap a highlight to remove it. */
export function AnnotatableText({ text, highlights, defaultHighlights = [], onHighlightsChange, label = "지문" }: AnnotatableTextProps) {
  const [ranges, setRanges] = useControllable<Range[]>(highlights, defaultHighlights, onHighlightsChange);
  const root = useRef<HTMLParagraphElement>(null);

  const onSelectEnd = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !root.current) return;
    const range = sel.getRangeAt(0);
    if (!root.current.contains(range.commonAncestorContainer)) return;
    const pre = document.createRange();
    pre.selectNodeContents(root.current);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const end = start + range.toString().length;
    setRanges(mergeRanges([...ranges, { start, end }]));
    sel.removeAllRanges();
  };

  return (
    <p ref={root} className="oe-annotatable" aria-label={label} onPointerUp={onSelectEnd}>
      {segments(text, ranges).map((seg, i) =>
        seg.highlighted ? (
          <mark
            key={i}
            className="oe-annotatable__mark"
            role="button"
            tabIndex={0}
            aria-label={`형광펜 해제: ${seg.text}`}
            onClick={() => setRanges(ranges.filter((r) => !(r.start < seg.range!.end && r.end > seg.range!.start)))}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.currentTarget.click()}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}
