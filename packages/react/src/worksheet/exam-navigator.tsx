import type { QuestionItem } from "@openedu/content";
import { Button } from "../primitives/button.tsx";
import { isAnswered, itemDomId, type Answers } from "./types.ts";

export type NavStatus = "answered" | "skipped" | "todo";

export type ExamNavigatorProps = {
  items: Pick<QuestionItem, "id">[];
  answers: Answers;
  /** Items the student has already opened; unanswered ones among them count as skipped. */
  visited?: string[];
  currentId?: string;
  onNavigate?: (id: string) => void;
  remainingSeconds?: number;
  onSubmit?: () => void;
  label?: string;
};

const statusText: Record<NavStatus, string> = { answered: "답 완료", skipped: "건너뜀", todo: "미응답" };

export const mmss = (total: number) => {
  const s = Math.max(0, Math.floor(total));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function ExamNavigator({ items, answers, visited = [], currentId, onNavigate, remainingSeconds, onSubmit, label = "문항 목록" }: ExamNavigatorProps) {
  const status = (id: string): NavStatus =>
    isAnswered(answers[id]) ? "answered" : visited.includes(id) && id !== currentId ? "skipped" : "todo";
  const done = items.filter((i) => status(i.id) === "answered").length;

  return (
    <nav className="oe-navigator" aria-label={label}>
      {remainingSeconds !== undefined ? (
        <p role="timer" className="oe-navigator__timer">{mmss(remainingSeconds)}</p>
      ) : null}
      <p className="oe-navigator__summary">{done} / {items.length} 완료</p>
      <ol className="oe-navigator__palette">
        {items.map((item, i) => {
          const s = status(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                className="oe-navigator__cell"
                data-status={s}
                aria-current={item.id === currentId ? "true" : undefined}
                aria-label={`${i + 1}번 문항, ${statusText[s]}`}
                onClick={() => {
                  document.getElementById(itemDomId(item.id))?.scrollIntoView?.({ block: "start" });
                  onNavigate?.(item.id);
                }}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
      {onSubmit ? <Button onClick={onSubmit}>제출</Button> : null}
    </nav>
  );
}
