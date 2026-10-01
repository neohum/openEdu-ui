import { z } from "zod";

const id = z.string().min(1);
const text = z.string().min(1);
const choiceLike = z.object({ id, content: text });

const base = {
  id,
  points: z.number().positive(),
  stem: text,
  passageRef: id.optional(),
  explanation: z.string().optional(),
};

const unique = (ids: string[]) => new Set(ids).size === ids.length;

export const choiceItem = z
  .object({
    ...base,
    type: z.literal("choice"),
    multiple: z.boolean().default(false),
    options: z.array(choiceLike).min(2),
    answer: z.array(id).min(1),
  })
  .superRefine((item, ctx) => {
    const ids = item.options.map((o) => o.id);
    if (!unique(ids)) ctx.addIssue({ code: "custom", path: ["options"], message: "option ids must be unique" });
    if (item.answer.some((a) => !ids.includes(a)))
      ctx.addIssue({ code: "custom", path: ["answer"], message: "answer must reference option ids" });
    if (!item.multiple && item.answer.length !== 1)
      ctx.addIssue({ code: "custom", path: ["answer"], message: "single-answer choice needs exactly one answer" });
  });

export const clozeItem = z
  .object({
    ...base,
    type: z.literal("cloze"),
    /** Blanks are written as {{id}} inside text. */
    text,
    blanks: z.array(z.object({ id, answers: z.array(text).min(1) })).min(1),
  })
  .superRefine((item, ctx) => {
    for (const b of item.blanks)
      if (!item.text.includes(`{{${b.id}}}`))
        ctx.addIssue({ code: "custom", path: ["text"], message: `text is missing placeholder {{${b.id}}}` });
  });

export const matchingItem = z
  .object({
    ...base,
    type: z.literal("matching"),
    left: z.array(choiceLike).min(2),
    right: z.array(choiceLike).min(2),
    answer: z.array(z.object({ left: id, right: id })).min(1),
  })
  .superRefine((item, ctx) => {
    const l = item.left.map((x) => x.id);
    const r = item.right.map((x) => x.id);
    if (item.answer.some((a) => !l.includes(a.left) || !r.includes(a.right)))
      ctx.addIssue({ code: "custom", path: ["answer"], message: "answer must reference left/right ids" });
  });

export const orderingItem = z
  .object({
    ...base,
    type: z.literal("ordering"),
    items: z.array(choiceLike).min(2),
    answer: z.array(id).min(2),
  })
  .superRefine((item, ctx) => {
    const ids = item.items.map((x) => x.id);
    if (!unique(ids) || [...ids].sort().join() !== [...item.answer].sort().join())
      ctx.addIssue({ code: "custom", path: ["answer"], message: "answer must be a permutation of item ids" });
  });

const spot = z.discriminatedUnion("shape", [
  z.object({ id, shape: z.literal("rect"), x: z.number(), y: z.number(), w: z.number().positive(), h: z.number().positive() }),
  z.object({ id, shape: z.literal("circle"), cx: z.number(), cy: z.number(), r: z.number().positive() }),
]);

export const hotspotItem = z
  .object({
    ...base,
    type: z.literal("hotspot"),
    image: z.object({ src: text, alt: text, width: z.number().positive(), height: z.number().positive() }),
    spots: z.array(spot).min(1),
    answer: z.array(id).min(1),
  })
  .superRefine((item, ctx) => {
    const ids = item.spots.map((s) => s.id);
    if (item.answer.some((a) => !ids.includes(a)))
      ctx.addIssue({ code: "custom", path: ["answer"], message: "answer must reference spot ids" });
  });

export const shortAnswerItem = z.object({
  ...base,
  type: z.literal("short-answer"),
  answers: z.array(text).min(1),
  caseSensitive: z.boolean().default(false),
});

export const questionItem = z.union([choiceItem, clozeItem, matchingItem, orderingItem, hotspotItem, shortAnswerItem]);

export const passage = z.object({ id, title: z.string().optional(), content: text });

export const paper = z
  .object({
    id,
    title: text,
    passages: z.array(passage).default([]),
    items: z.array(questionItem).min(1),
  })
  .superRefine((p, ctx) => {
    const passageIds = new Set(p.passages.map((x) => x.id));
    if (passageIds.size !== p.passages.length)
      ctx.addIssue({ code: "custom", path: ["passages"], message: "passage ids must be unique" });
    if (!unique(p.items.map((i) => i.id)))
      ctx.addIssue({ code: "custom", path: ["items"], message: "item ids must be unique" });
    p.items.forEach((it, i) => {
      if (it.passageRef && !passageIds.has(it.passageRef))
        ctx.addIssue({ code: "custom", path: ["items", i, "passageRef"], message: `unknown passage "${it.passageRef}"` });
    });
  });

export type QuestionItem = z.infer<typeof questionItem>;
export type Passage = z.infer<typeof passage>;
export type Paper = z.infer<typeof paper>;
