import type { QuestionItem } from "@openedu/content";
import type { ReactNode } from "react";
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

export function MatchingItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"matching">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? {}, onChange);
  const map = asMap(current);
  return (
    <Shell item={item} number={number}>
      <ul className="oe-matching">
        {item.left.map((l) => (
          <li key={l.id} className="oe-matching__row">
            <label htmlFor={`${item.id}-${l.id}`}>{l.content}</label>
            <select id={`${item.id}-${l.id}`} value={map[l.id] ?? ""} disabled={readOnly} onChange={(e) => set({ ...map, [l.id]: e.target.value })}>
              <option value="">선택</option>
              {item.right.map((r) => (
                <option key={r.id} value={r.id}>{r.content}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function OrderingItem({ item, value, defaultValue, onChange, readOnly, number }: ItemProps<Of<"ordering">> & { number?: number }) {
  const [current, set] = useControllable<AnswerValue>(value, defaultValue ?? item.items.map((i) => i.id), onChange);
  const order = asIds(current);
  const byId = new Map(item.items.map((i) => [i.id, i.content]));
  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    set(next);
  };
  return (
    <Shell item={item} number={number}>
      <ol className="oe-ordering">
        {order.map((id, i) => (
          <li key={id} className="oe-ordering__row">
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
