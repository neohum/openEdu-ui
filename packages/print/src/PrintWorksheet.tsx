import type { Paper, QuestionItem } from "@openedu/content";
import type { ReactNode } from "react";

export type PrintMode = "student" | "teacher";

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

function Answer({ children }: { children: ReactNode }) {
  return <p className="oe-print__answer"><strong>정답</strong> {children}</p>;
}

function Body({ item, mode }: { item: QuestionItem; mode: PrintMode }) {
  const teacher = mode === "teacher";
  switch (item.type) {
    case "choice":
      return (
        <ol className="oe-print__options">
          {item.options.map((o) => (
            <li key={o.id} data-correct={teacher && item.answer.includes(o.id) ? "" : undefined}>
              <span className="oe-print__bubble">{o.id}</span> {o.content}
            </li>
          ))}
        </ol>
      );
    case "cloze": {
      const parts = item.text.split(/\{\{([^}]+)\}\}/);
      return (
        <>
          <p className="oe-print__cloze">
            {parts.map((part, i) => {
              if (i % 2 === 0) return <span key={i}>{part}</span>;
              const blank = item.blanks.find((b) => b.id === part);
              return teacher
                ? <span key={i} className="oe-print__blank oe-print__blank--filled">{blank?.answers[0]}</span>
                : <span key={i} className="oe-print__blank" />;
            })}
          </p>
        </>
      );
    }
    case "matching": {
      const right = byId(item.right);
      return (
        <div className="oe-print__matching">
          <ul>{item.left.map((l) => <li key={l.id}>{l.content}</li>)}</ul>
          <ul>{item.right.map((r) => <li key={r.id}>{r.content}</li>)}</ul>
          {teacher ? (
            <Answer>{item.answer.map((a) => `${byId(item.left).get(a.left)?.content} → ${right.get(a.right)?.content}`).join(", ")}</Answer>
          ) : null}
        </div>
      );
    }
    case "ordering": {
      const map = byId(item.items);
      return (
        <>
          <ul className="oe-print__ordering">
            {item.items.map((i) => (
              <li key={i.id}><span className="oe-print__box" /> {i.content}</li>
            ))}
          </ul>
          {teacher ? <Answer>{item.answer.map((id) => map.get(id)?.content).join(" → ")}</Answer> : null}
        </>
      );
    }
    case "hotspot":
      return (
        <>
          <p className="oe-print__figure">[그림: {item.image.alt}]</p>
          {teacher ? <Answer>영역 {item.answer.map((id) => item.spots.findIndex((s) => s.id === id) + 1).join(", ")}</Answer> : null}
        </>
      );
    case "short-answer":
      return <p className="oe-print__line">{teacher ? <span className="oe-print__blank oe-print__blank--filled">{item.answers[0]}</span> : null}</p>;
  }
}

function choiceAnswer(item: QuestionItem): ReactNode {
  return item.type === "choice" ? <Answer>{item.answer.join(", ")}</Answer> : null;
}

export type PrintWorksheetProps = { paper: Paper; mode?: PrintMode };

/** Static, print-first rendering of the same paper data the screen components use. */
export function PrintWorksheet({ paper, mode = "student" }: PrintWorksheetProps) {
  const passages = byId(paper.passages);
  const shown = new Set<string>();
  const teacher = mode === "teacher";

  return (
    <article className="oe-print" data-mode={mode}>
      <header className="oe-print__header">
        <h1>{paper.title}{teacher ? " (교사용)" : ""}</h1>
        {!teacher ? <p className="oe-print__who">이름: <span className="oe-print__blank" /> 날짜: <span className="oe-print__blank" /></p> : null}
      </header>
      {paper.items.map((item, i) => {
        const passage = item.passageRef && !shown.has(item.passageRef) ? passages.get(item.passageRef) : undefined;
        if (passage) shown.add(passage.id);
        return (
          <section key={item.id} className="oe-print__item" data-type={item.type}>
            {passage ? (
              <blockquote className="oe-print__passage">
                {passage.title ? <strong>{passage.title}</strong> : null}
                <p>{passage.content}</p>
              </blockquote>
            ) : null}
            <p className="oe-print__stem"><span className="oe-print__number">{i + 1}.</span> {item.stem} <span className="oe-print__points">[{item.points}점]</span></p>
            <Body item={item} mode={mode} />
            {teacher ? choiceAnswer(item) : null}
            {teacher && item.explanation ? <p className="oe-print__explanation"><strong>해설</strong> {item.explanation}</p> : null}
          </section>
        );
      })}
    </article>
  );
}
