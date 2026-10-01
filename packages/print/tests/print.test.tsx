import { paper } from "@openedu/content";
import samplePaper from "../../content/src/samples/paper.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrintWorksheet } from "../src/index.ts";

const data = paper.parse(samplePaper);
const student = renderToStaticMarkup(<PrintWorksheet paper={data} />);
const teacher = renderToStaticMarkup(<PrintWorksheet paper={data} mode="teacher" />);

describe("PrintWorksheet", () => {
  it("renders every item once, numbered, with its passage before the first related item", () => {
    expect((student.match(/class="oe-print__item"/g) ?? []).length).toBe(data.items.length);
    expect((student.match(/손으로 문장을 따라 쓰면/g) ?? []).length).toBe(1);
    expect(student.indexOf("oe-print__passage")).toBeLessThan(student.indexOf("oe-print__stem"));
    expect(student).toContain("6.");
  });

  it("student mode never leaks answers or explanations", () => {
    expect(student).not.toContain("정답");
    expect(student).not.toContain("해설");
    expect(student).not.toContain("data-correct");
    expect(student).not.toContain("oe-print__blank--filled");
    expect(student).not.toContain("180도");
    expect(student).toContain("이름:");
  });

  it("teacher mode shows answers and explanations", () => {
    expect(teacher).toContain("(교사용)");
    expect(teacher).toContain("data-correct");
    expect(teacher).toContain("해설");
    expect(teacher).toContain("2문단에서 손으로 쓰는 행위");
    expect(teacher).toContain("서울");
    expect(teacher).toContain("씨앗을 심는다 → 싹이 튼다 → 꽃이 핀다");
    expect(teacher).not.toContain("이름:");
  });

  it("never shows interactive controls on paper", () => {
    for (const html of [student, teacher]) expect(html).not.toMatch(/<(button|input|select)\b/);
  });
});

describe("print.css contract", () => {
  const css = readFileSync(join(import.meta.dirname, "../src/print.css"), "utf8");
  it("sets an A4 page and keeps items from splitting across pages", () => {
    expect(css).toMatch(/@page\s*\{[^}]*size: A4/);
    expect(css).toMatch(/\.oe-print__item\s*\{[^}]*break-inside: avoid/);
  });
  it("marks correct answers by weight and underline, not color alone (black & white safe)", () => {
    expect(css).toMatch(/li\[data-correct\][^}]*font-weight[^}]*text-decoration: underline/);
  });
});
