import { describe, expect, it } from "vitest";
import { paper, questionItem } from "../src/schema.ts";
import choice from "../src/samples/choice.json";
import cloze from "../src/samples/cloze.json";
import matching from "../src/samples/matching.json";
import ordering from "../src/samples/ordering.json";
import hotspot from "../src/samples/hotspot.json";
import shortAnswer from "../src/samples/short-answer.json";
import samplePaper from "../src/samples/paper.json";

const samples = { choice, cloze, matching, ordering, hotspot, "short-answer": shortAnswer };
const clone = <T>(v: T): T => structuredClone(v);

describe("question items", () => {
  it.each(Object.entries(samples))("accepts a valid %s sample", (type, sample) => {
    const parsed = questionItem.parse(sample);
    expect(parsed.type).toBe(type);
  });

  it.each(Object.entries(samples))("rejects a %s sample missing its stem", (_type, sample) => {
    const bad: Record<string, unknown> = clone(sample);
    delete bad.stem;
    const r = questionItem.safeParse(bad);
    expect(r.success).toBe(false);
  });

  it("rejects a choice answer that is not an option id", () => {
    const r = questionItem.safeParse({ ...clone(choice), answer: ["9"] });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain("option ids");
  });

  it("rejects a cloze whose text lacks a declared blank", () => {
    expect(questionItem.safeParse({ ...clone(cloze), text: "빈칸이 없다" }).success).toBe(false);
  });

  it("rejects an ordering answer that is not a permutation", () => {
    expect(questionItem.safeParse({ ...clone(ordering), answer: ["d", "s"] }).success).toBe(false);
  });

  it("rejects unknown item types", () => {
    expect(questionItem.safeParse({ ...clone(choice), type: "essay" }).success).toBe(false);
  });
});

describe("paper", () => {
  it("accepts the sample paper with all six item types", () => {
    const p = paper.parse(samplePaper);
    expect(new Set(p.items.map((i) => i.type)).size).toBe(6);
  });

  it("fails when passageRef points to a missing passage", () => {
    const bad = clone(samplePaper);
    bad.items[0]!.passageRef = "passage-404";
    const r = paper.safeParse(bad);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain("passage-404");
  });

  it("fails on duplicate item ids", () => {
    const bad = clone(samplePaper);
    bad.items[1]!.id = bad.items[0]!.id;
    expect(paper.safeParse(bad).success).toBe(false);
  });
});
