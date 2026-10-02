import type { QuestionItem } from "@openedu/content";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../primitives/button.tsx";
import { Icon } from "../primitives/icon.tsx";
import { Input } from "../primitives/input.tsx";
import { useControllable } from "./use-controllable.ts";
import { itemDomId, type AnswerValue, type ItemProps } from "./types.ts";

type Of<T extends QuestionItem["type"]> = Extract<QuestionItem, { type: T }>;

const asIds = (v: AnswerValue | undefined): string[] => (Array.isArray(v) ? v : []);
const asMap = (v: AnswerValue | undefined): Record<string, string> => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

export function QuestionHeader({ number, points, children }: { number: number; points: number; children: ReactNode }) {
  return (
    <div className="oe-question__header">
      <span className="oe-question__number">{number}</span>
      <p className="oe-question__stem">{children}</p>
      <span className="oe-question__points">{points}점</span>
    </div>
  );
}

function Shell({ item, number, children }: { item: QuestionItem; number?: number; children: ReactNode }) {
  return (
    <section id={itemDomId(item.id)} className="oe-question" data-type={item.type} aria-label={number ? `${number}번 문항` : item.stem}>
      <QuestionHeader number={number ?? 0} points={item.points}>{item.stem}</QuestionHeader>
      {children}
    </section>
  );
}

export function ChoiceItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"choice">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? [], onChange);
  const selected = asIds(current);
  const toggle = (id: string) =>
    set(item.multiple ? (selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]) : [id]);
  return (
    <Shell item={item} number={number}>
      <div role={item.multiple ? "group" : "radiogroup"} aria-label={item.stem} className="oe-choices">
        {item.options.map((o) => (
          <label key={o.id} className="oe-choice" data-selected={selected.includes(o.id) || undefined}>
            <input
              type={item.multiple ? "checkbox" : "radio"}
              name={item.id}
              checked={selected.includes(o.id)}
              disabled={readOnly}
              onChange={() => toggle(o.id)}
            />
            <span className="oe-choice__mark">{o.id}</span>
            <span>{o.content}</span>
          </label>
        ))}
      </div>
    </Shell>
  );
}

export function ClozeItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"cloze">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? {}, onChange);
  const map = asMap(current);
  const parts = item.text.split(/\{\{([^}]+)\}\}/);
  return (
    <Shell item={item} number={number}>
      <p className="oe-cloze">
        {parts.map((part, i) =>
          i % 2 === 0 ? (
            <span key={i}>{part}</span>
          ) : (
            <input
              key={i}
              className="oe-cloze__blank"
              aria-label={`빈칸 ${part}`}
              value={map[part] ?? ""}
              disabled={readOnly}
              onChange={(e) => set({ ...map, [part]: e.target.value })}
            />
          ),
        )}
      </p>
    </Shell>
  );
}

type AnchorSide = "left" | "right";

interface DragState {
  side: AnchorSide;
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
}

interface DragPreview {
  side: AnchorSide;
  id: string;
  x: number;
  y: number;
}

export function MatchingItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"matching">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? {}, onChange);
  const map = asMap(current);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftAnchorRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightAnchorRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [selectedAnchor, setSelectedAnchor] = useState<{ side: AnchorSide; id: string } | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const [coords, setCoords] = useState<{
    left: Record<string, { x: number; y: number }>;
    right: Record<string, { x: number; y: number }>;
  }>({ left: {}, right: {} });

  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const nextLeft: Record<string, { x: number; y: number }> = {};
    const nextRight: Record<string, { x: number; y: number }> = {};

    item.left.forEach((l, index) => {
      const el = leftAnchorRefs.current[l.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          nextLeft[l.id] = {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
          return;
        }
      }
      nextLeft[l.id] = { x: 100, y: 30 + index * 54 };
    });

    item.right.forEach((r, index) => {
      const el = rightAnchorRefs.current[r.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          nextRight[r.id] = {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
          return;
        }
      }
      nextRight[r.id] = { x: 300, y: 30 + index * 54 };
    });

    setCoords({ left: nextLeft, right: nextRight });
  }, [item.left, item.right]);

  useEffect(() => {
    updateCoords();
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      const observer = new ResizeObserver(() => updateCoords());
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
    const handleResize = () => updateCoords();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCoords]);

  const handleSelectChange = (leftId: string, rightId: string) => {
    const next = { ...map };
    if (rightId) {
      next[leftId] = rightId;
    } else {
      delete next[leftId];
    }
    set(next);
  };

  const handleDisconnect = (leftId: string) => {
    if (readOnly) return;
    const next = { ...map };
    delete next[leftId];
    set(next);
    setSelectedAnchor(null);
  };

  const handleAnchorClick = (side: AnchorSide, id: string) => {
    if (readOnly) return;
    if (suppressClickRef.current) return;

    if (!selectedAnchor) {
      setSelectedAnchor({ side, id });
      return;
    }

    if (selectedAnchor.side === side) {
      if (selectedAnchor.id === id) {
        setSelectedAnchor(null);
      } else {
        setSelectedAnchor({ side, id });
      }
      return;
    }

    const leftId = side === "right" ? selectedAnchor.id : id;
    const rightId = side === "right" ? id : selectedAnchor.id;

    if (map[leftId] === rightId) {
      handleDisconnect(leftId);
    } else {
      set({ ...map, [leftId]: rightId });
    }
    setSelectedAnchor(null);
  };

  const handlePointerDown = (side: AnchorSide, id: string, e: React.PointerEvent) => {
    if (readOnly) return;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const container = containerRef.current;
    const cr = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    const curX = cr.width > 0 ? e.clientX - cr.left : (side === "left" ? 100 : 300);
    const curY = cr.height > 0 ? e.clientY - cr.top : 30;

    dragStateRef.current = {
      side,
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    setDragPreview({
      side,
      id,
      x: curX,
      y: curY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = Math.abs(e.clientX - drag.startX);
    const dy = Math.abs(e.clientY - drag.startY);
    if (dx > 5 || dy > 5) {
      drag.moved = true;
    }
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    setDragPreview({
      side: drag.side,
      id: drag.id,
      x: cr.width > 0 ? e.clientX - cr.left : (drag.side === "left" ? 100 : 300),
      y: cr.height > 0 ? e.clientY - cr.top : 30,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (drag.moved) {
      const target = typeof document !== "undefined" ? document.elementFromPoint(e.clientX, e.clientY) : null;
      const anchorEl = target?.closest<HTMLElement>("[data-anchor-side]");
      if (anchorEl) {
        const targetSide = anchorEl.getAttribute("data-anchor-side") as AnchorSide | null;
        const targetId = anchorEl.getAttribute("data-anchor-id");
        if (targetSide && targetId && targetSide !== drag.side) {
          const leftId = drag.side === "left" ? drag.id : targetId;
          const rightId = drag.side === "right" ? drag.id : targetId;
          set({ ...map, [leftId]: rightId });
          setSelectedAnchor(null);
        }
      }
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 50);
    }
    dragStateRef.current = null;
    setDragPreview(null);
  };

  const handlePointerCancel = () => {
    dragStateRef.current = null;
    setDragPreview(null);
  };

  const leftContentMap = new Map(item.left.map((l) => [l.id, l.content]));
  const rightContentMap = new Map(item.right.map((r) => [r.id, r.content]));

  const connections = Object.entries(map)
    .filter(([leftId, rightId]) => rightId && item.right.some((r) => r.id === rightId) && item.left.some((l) => l.id === leftId))
    .map(([leftId, rightId]) => {
      const lIndex = item.left.findIndex((l) => l.id === leftId);
      const rIndex = item.right.findIndex((r) => r.id === rightId);
      const start = coords.left[leftId] ?? { x: 100, y: 30 + lIndex * 54 };
      const end = coords.right[rightId] ?? { x: 300, y: 30 + rIndex * 54 };
      return {
        leftId,
        rightId,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        leftLabel: leftContentMap.get(leftId) ?? leftId,
        rightLabel: rightContentMap.get(rightId) ?? rightId,
      };
    });

  let preview: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (dragPreview) {
    const isLeft = dragPreview.side === "left";
    const index = isLeft ? item.left.findIndex((l) => l.id === dragPreview.id) : item.right.findIndex((r) => r.id === dragPreview.id);
    const anchorPt = isLeft
      ? (coords.left[dragPreview.id] ?? { x: 100, y: 30 + index * 54 })
      : (coords.right[dragPreview.id] ?? { x: 300, y: 30 + index * 54 });
    preview = isLeft
      ? { x1: anchorPt.x, y1: anchorPt.y, x2: dragPreview.x, y2: dragPreview.y }
      : { x1: dragPreview.x, y1: dragPreview.y, x2: anchorPt.x, y2: anchorPt.y };
  }

  const isRightConnected = (rightId: string) => Object.values(map).includes(rightId);

  return (
    <Shell item={item} number={number}>
      <div
        ref={containerRef}
        className="oe-matching"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <svg className="oe-matching__svg" aria-label="연결선 영역">
          {connections.map((conn) => (
            <line
              key={`${conn.leftId}-${conn.rightId}`}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              className="oe-matching__line"
              data-left={conn.leftId}
              data-right={conn.rightId}
              role="button"
              tabIndex={readOnly ? -1 : 0}
              aria-label={`${conn.leftLabel}와(과) ${conn.rightLabel} 연결선, 클릭하여 해제`}
              onClick={() => handleDisconnect(conn.leftId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDisconnect(conn.leftId);
                }
              }}
            />
          ))}
          {preview && (
            <line
              x1={preview.x1}
              y1={preview.y1}
              x2={preview.x2}
              y2={preview.y2}
              className="oe-matching__line oe-matching__line--preview"
              aria-hidden="true"
            />
          )}
        </svg>

        <div className="oe-matching__columns">
          <ul className="oe-matching__column oe-matching__column--left" aria-label="왼쪽 항목 목록">
            {item.left.map((l) => {
              const isConnected = Boolean(map[l.id]);
              const isSelected = selectedAnchor?.side === "left" && selectedAnchor.id === l.id;
              return (
                <li key={l.id} className="oe-matching__row oe-matching__row--left" data-id={l.id}>
                  <div className="oe-matching__item-body">
                    <label htmlFor={`${item.id}-${l.id}`} className="oe-matching__label">
                      {l.content}
                    </label>
                    <select
                      id={`${item.id}-${l.id}`}
                      value={map[l.id] ?? ""}
                      disabled={readOnly}
                      onChange={(e) => handleSelectChange(l.id, e.target.value)}
                      className="oe-matching__select"
                      aria-label={`${l.content} 연결 대상 선택`}
                    >
                      <option value="">선택</option>
                      {item.right.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.content}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    ref={(el) => {
                      leftAnchorRefs.current[l.id] = el;
                    }}
                    className="oe-matching__anchor oe-matching__anchor--left"
                    data-anchor-side="left"
                    data-anchor-id={l.id}
                    data-active={isSelected || undefined}
                    data-connected={isConnected || undefined}
                    aria-pressed={isSelected}
                    aria-label={`${l.content} 연결점`}
                    disabled={readOnly}
                    onClick={() => handleAnchorClick("left", l.id)}
                    onPointerDown={(e) => handlePointerDown("left", l.id, e)}
                  >
                    <span className="oe-matching__anchor-pin" />
                  </button>
                </li>
              );
            })}
          </ul>

          <ul className="oe-matching__column oe-matching__column--right" aria-label="오른쪽 항목 목록">
            {item.right.map((r) => {
              const isConnected = isRightConnected(r.id);
              const isSelected = selectedAnchor?.side === "right" && selectedAnchor.id === r.id;
              return (
                <li key={r.id} className="oe-matching__row oe-matching__row--right" data-id={r.id}>
                  <button
                    type="button"
                    ref={(el) => {
                      rightAnchorRefs.current[r.id] = el;
                    }}
                    className="oe-matching__anchor oe-matching__anchor--right"
                    data-anchor-side="right"
                    data-anchor-id={r.id}
                    data-active={isSelected || undefined}
                    data-connected={isConnected || undefined}
                    aria-pressed={isSelected}
                    aria-label={`${r.content} 연결점`}
                    disabled={readOnly}
                    onClick={() => handleAnchorClick("right", r.id)}
                    onPointerDown={(e) => handlePointerDown("right", r.id, e)}
                  >
                    <span className="oe-matching__anchor-pin" />
                  </button>
                  <div className="oe-matching__item-body">
                    <span className="oe-matching__content">{r.content}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Shell>
  );
}

export function OrderingItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"ordering">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? item.items.map((i) => i.id), onChange);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const order = asIds(current);
  const byId = new Map(item.items.map((i) => [i.id, i.content]));

  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    set(next);
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    if (readOnly) {
      e.preventDefault();
      return;
    }
    try {
      e.dataTransfer?.setData("text/plain", String(index));
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
      }
    } catch {
      /* ignore in environments with partial DataTransfer */
    }
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    if (readOnly) return;
    e.preventDefault();
    try {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
    } catch {
      /* ignore */
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetIndex: number) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    let sourceIndex = draggedIndex;
    try {
      const data = e.dataTransfer?.getData("text/plain");
      if (data !== undefined && data !== "") {
        const parsed = Number.parseInt(data, 10);
        if (!Number.isNaN(parsed)) {
          sourceIndex = parsed;
        }
      }
    } catch {
      /* fallback to draggedIndex */
    }
    if (sourceIndex != null && sourceIndex >= 0 && sourceIndex < order.length && sourceIndex !== targetIndex) {
      const next = [...order];
      const [moved] = next.splice(sourceIndex, 1);
      if (moved !== undefined) {
        next.splice(targetIndex, 0, moved);
        set(next);
      }
    }
    setDraggedIndex(null);
  };

  return (
    <Shell item={item} number={number}>
      <ol className="oe-ordering">
        {order.map((id, i) => (
          <li
            key={id}
            className={`oe-ordering__row${draggedIndex === i ? " oe-ordering__row--dragging" : ""}`}
            data-dragging={draggedIndex === i || undefined}
            draggable={!readOnly}
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, i)}
          >
            <span className="oe-ordering__handle" aria-hidden="true">
              <Icon name="dots-six-vertical" />
            </span>
            <span>{byId.get(id)}</span>
            <Button variant="ghost" size="sm" disabled={readOnly || i === 0} aria-label={`${byId.get(id)} 위로`} onClick={() => move(i, -1)}><Icon name="arrow-up" /></Button>
            <Button variant="ghost" size="sm" disabled={readOnly || i === order.length - 1} aria-label={`${byId.get(id)} 아래로`} onClick={() => move(i, 1)}><Icon name="arrow-down" /></Button>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

export function HotspotItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"hotspot">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? [], onChange);
  const selected = asIds(current);
  const { width, height } = item.image;
  const pct = (n: number, total: number) => `${(n / total) * 100}%`;
  return (
    <Shell item={item} number={number}>
      <div className="oe-hotspot">
        <img src={item.image.src} alt={item.image.alt} />
        {item.spots.map((s, i) => {
          const box =
            s.shape === "rect"
              ? { "--oe-x": pct(s.x, width), "--oe-y": pct(s.y, height), "--oe-w": pct(s.w, width), "--oe-h": pct(s.h, height) }
              : { "--oe-x": pct(s.cx - s.r, width), "--oe-y": pct(s.cy - s.r, height), "--oe-w": pct(s.r * 2, width), "--oe-h": pct(s.r * 2, height) };
          return (
            <button
              key={s.id}
              type="button"
              className="oe-hotspot__spot"
              data-shape={s.shape}
              aria-label={`영역 ${i + 1}`}
              aria-pressed={selected.includes(s.id)}
              disabled={readOnly}
              style={box as React.CSSProperties}
              onClick={() => set(selected.includes(s.id) ? selected.filter((x) => x !== s.id) : [...selected, s.id])}
            />
          );
        })}
      </div>
    </Shell>
  );
}

export function ShortAnswerItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"short-answer">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? "", onChange);
  return (
    <Shell item={item} number={number}>
      <Input label="답" value={typeof current === "string" ? current : ""} disabled={readOnly} onChange={(e) => set(e.target.value)} />
    </Shell>
  );
}

/** Picks the renderer for an item by its type. */
export function ItemRenderer({ item, ...rest }: ItemProps & { number?: number }) {
  switch (item.type) {
    case "choice": return <ChoiceItem item={item} {...rest} />;
    case "cloze": return <ClozeItem item={item} {...rest} />;
    case "matching": return <MatchingItem item={item} {...rest} />;
    case "ordering": return <OrderingItem item={item} {...rest} />;
    case "hotspot": return <HotspotItem item={item} {...rest} />;
    case "short-answer": return <ShortAnswerItem item={item} {...rest} />;
  }
}
