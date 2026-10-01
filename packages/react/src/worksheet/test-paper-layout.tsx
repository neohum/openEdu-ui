import type { ReactNode } from "react";

export type TestPaperLayoutProps = {
  passage?: ReactNode;
  passageLabel?: string;
  questions: ReactNode;
  navigator?: ReactNode;
};

/**
 * Passage stays visible beside the questions on wide screens; on narrow screens it
 * stacks above them inside a collapsible <details> so it never competes for space.
 */
export function TestPaperLayout({ passage, passageLabel = "지문", questions, navigator }: TestPaperLayoutProps) {
  return (
    <div className="oe-paper" data-has-passage={passage ? "" : undefined}>
      {passage ? (
        <details className="oe-paper__passage" open>
          <summary>{passageLabel}</summary>
          <div className="oe-paper__passage-body">{passage}</div>
        </details>
      ) : null}
      <div className="oe-paper__questions">{questions}</div>
      {navigator ? <aside className="oe-paper__navigator">{navigator}</aside> : null}
    </div>
  );
}
