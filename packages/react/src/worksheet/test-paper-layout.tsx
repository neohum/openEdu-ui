import type { ReactNode } from "react";

export type TestPaperLayoutProps = {
  passage?: ReactNode;
  passageLabel?: string;
  questions: ReactNode;
  navigator?: ReactNode;
};

/**
 * Wide screens: a sticky side column (passage + answer palette) beside the questions.
 * Narrow screens: everything stacks, and the passage sits in a collapsible <details>
 * so it never competes with the questions for space.
 */
export function TestPaperLayout({ passage, passageLabel = "지문", questions, navigator }: TestPaperLayoutProps) {
  const hasSide = Boolean(passage || navigator);
  return (
    <div className="oe-paper" data-has-side={hasSide ? "" : undefined}>
      {hasSide ? (
        <div className="oe-paper__side">
          {passage ? (
            <details className="oe-paper__passage" open>
              <summary>{passageLabel}</summary>
              <div className="oe-paper__passage-body">{passage}</div>
            </details>
          ) : null}
          {navigator ? <aside className="oe-paper__navigator">{navigator}</aside> : null}
        </div>
      ) : null}
      <div className="oe-paper__questions">{questions}</div>
    </div>
  );
}
