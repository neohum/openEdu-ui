import type { QuestionItem } from "@openedu/content";

/** choice / ordering / hotspot → ids, cloze / matching → id→value map, short-answer → text. */
export type AnswerValue = string | string[] | Record<string, string>;
export type Answers = Record<string, AnswerValue>;
export type ItemProps<T extends QuestionItem = QuestionItem> = {
  item: T;
  value?: AnswerValue;
  defaultValue?: AnswerValue;
  onChange?: (value: AnswerValue) => void;
  readOnly?: boolean;
};

export const itemDomId = (id: string) => `oe-item-${id}`;

export function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return Object.values(value).some((v) => v.trim() !== "");
}
