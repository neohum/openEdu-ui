import { paper } from "@openedu/content";
import samplePaper from "../../content/src/samples/paper.json";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  AnnotatableText, ExamNavigator, ItemRenderer, TestPaperLayout, isAnswered, mmss,
  mergeRanges, segments, type AnswerValue,
} from "../src/index.ts";

const items = paper.parse(samplePaper).items;
const byType = (type: string) => items.find((i) => i.type === type)!;

describe("ItemRenderer — one UI per question type", () => {
  it("choice: radio group, uncontrolled and controlled", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<ItemRenderer item={byType("choice")} number={1} onChange={onChange} />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    await userEvent.click(screen.getByRole("radio", { name: /직접 문장을/ }));
    expect(onChange).toHaveBeenLastCalledWith(["2"]);
    expect(screen.getByRole("radio", { name: /직접 문장을/ })).toBeChecked();

    rerender(<ItemRenderer item={byType("choice")} number={1} value={["3"]} onChange={onChange} />);
    expect(screen.getByRole("radio", { name: /받아쓰기/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /직접 문장을/ })).not.toBeChecked();
  });

  it("cloze: inline inputs per blank", async () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("cloze")} onChange={onChange} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    await userEvent.type(screen.getByRole("textbox", { name: "빈칸 1" }), "1");
    expect(onChange).toHaveBeenLastCalledWith({ "1": "1" });
  });

  it("matching: one select per left item", async () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("matching")} onChange={onChange} />);
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2);
    await userEvent.selectOptions(screen.getByLabelText("대한민국"), "y");
    expect(onChange).toHaveBeenLastCalledWith({ a: "y" });
  });

  it("matching: renders anchor pins on left and right columns", () => {
    render(<ItemRenderer item={byType("matching")} />);
    expect(screen.getByRole("button", { name: "대한민국 연결점" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "일본 연결점" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "도쿄 연결점" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "서울 연결점" })).toBeInTheDocument();
  });

  it("matching: connects anchors via click and renders SVG line", async () => {
    const onChange = vi.fn();
    const { container } = render(<ItemRenderer item={byType("matching")} onChange={onChange} />);

    expect(container.querySelectorAll("line.oe-matching__line")).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "대한민국 연결점" }));
    expect(screen.getByRole("button", { name: "대한민국 연결점" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "서울 연결점" }));
    expect(onChange).toHaveBeenLastCalledWith({ a: "y" });
  });

  it("matching: renders SVG lines for connected items and allows disconnecting by clicking line", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<ItemRenderer item={byType("matching")} value={{ a: "y" }} onChange={onChange} />);

    const line = container.querySelector("line[data-left='a'][data-right='y']");
    expect(line).toBeInTheDocument();
    expect(line).toHaveAttribute("x1");
    expect(line).toHaveAttribute("y1");
    expect(line).toHaveAttribute("x2");
    expect(line).toHaveAttribute("y2");

    await userEvent.click(line!);
    expect(onChange).toHaveBeenLastCalledWith({});

    rerender(<ItemRenderer item={byType("matching")} value={{}} onChange={onChange} />);
    expect(container.querySelectorAll("line.oe-matching__line")).toHaveLength(0);
  });

  it("matching: reselecting already connected anchors disconnects them", async () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("matching")} value={{ a: "y" }} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "대한민국 연결점" }));
    await userEvent.click(screen.getByRole("button", { name: "서울 연결점" }));
    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it("matching: bidirectional synchronization between select dropdown and line", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<ItemRenderer item={byType("matching")} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText("대한민국"), "y");
    expect(onChange).toHaveBeenLastCalledWith({ a: "y" });

    rerender(<ItemRenderer item={byType("matching")} value={{ a: "y" }} onChange={onChange} />);
    expect(container.querySelector("line[data-left='a'][data-right='y']")).toBeInTheDocument();
    expect(screen.getByLabelText("대한민국")).toHaveValue("y");
  });

  it("matching: readOnly disables anchors and prevents changes", async () => {
    const onChange = vi.fn();
    const { container } = render(<ItemRenderer item={byType("matching")} value={{ a: "y" }} readOnly onChange={onChange} />);

    const leftAnchor = screen.getByRole("button", { name: "대한민국 연결점" });
    const rightAnchor = screen.getByRole("button", { name: "서울 연결점" });
    expect(leftAnchor).toBeDisabled();
    expect(rightAnchor).toBeDisabled();

    await userEvent.click(leftAnchor);
    expect(leftAnchor).toHaveAttribute("aria-pressed", "false");
    expect(onChange).not.toHaveBeenCalled();

    const line = container.querySelector("line[data-left='a'][data-right='y']");
    expect(line).toBeInTheDocument();
    await userEvent.click(line!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ordering: moves items with up/down buttons", async () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("ordering")} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "씨앗을 심는다 위로" }));
    expect(onChange).toHaveBeenLastCalledWith(["d", "s", "f"]);
    expect(screen.getByRole("button", { name: "싹이 튼다 위로" })).toBeEnabled();
    const rows = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(rows[0]).toContain("씨앗을 심는다");
  });

  it("ordering: supports drag and drop reordering with visual feedback", () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("ordering")} onChange={onChange} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);

    for (const row of rows) {
      expect(row).toHaveAttribute("draggable", "true");
      const handle = row.querySelector(".oe-ordering__handle");
      expect(handle).toBeInTheDocument();
      expect(handle?.querySelector(".ph-dots-six-vertical")).toBeInTheDocument();
    }

    fireEvent.dragStart(rows[0]!);
    expect(rows[0]).toHaveClass("oe-ordering__row--dragging");
    expect(rows[0]).toHaveAttribute("data-dragging", "true");

    fireEvent.dragOver(rows[2]!);
    fireEvent.drop(rows[2]!);

    expect(onChange).toHaveBeenLastCalledWith(["d", "f", "s"]);
    expect(rows[0]).not.toHaveClass("oe-ordering__row--dragging");
    expect(rows[0]).not.toHaveAttribute("data-dragging");
  });

  it("ordering: drag end cancels dragging state without change", () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("ordering")} onChange={onChange} />);
    const rows = screen.getAllByRole("listitem");

    fireEvent.dragStart(rows[1]!);
    expect(rows[1]).toHaveClass("oe-ordering__row--dragging");

    fireEvent.dragEnd(rows[1]!);
    expect(rows[1]).not.toHaveClass("oe-ordering__row--dragging");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ordering: readOnly disables drag and buttons", () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("ordering")} readOnly onChange={onChange} />);
    const rows = screen.getAllByRole("listitem");
    for (const row of rows) {
      expect(row).toHaveAttribute("draggable", "false");
    }
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }

    fireEvent.dragStart(rows[0]!);
    expect(rows[0]).not.toHaveClass("oe-ordering__row--dragging");
    fireEvent.drop(rows[2]!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("hotspot: toggles spots and exposes pressed state", async () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("hotspot")} onChange={onChange} />);
    expect(screen.getByRole("img", { name: "한반도 지도" })).toBeInTheDocument();
    const spot = screen.getByRole("button", { name: "영역 1" });
    await userEvent.click(spot);
    expect(spot).toHaveAttribute("aria-pressed", "true");
    expect(onChange).toHaveBeenLastCalledWith(["h1"]);
    await userEvent.click(spot);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("short-answer: labelled text input", async () => {
    const onChange = vi.fn();
    render(<ItemRenderer item={byType("short-answer")} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("답"), "9");
    expect(onChange).toHaveBeenLastCalledWith("9");
  });

  it("readOnly disables inputs", () => {
    render(<ItemRenderer item={byType("choice")} readOnly />);
    for (const r of screen.getAllByRole("radio")) expect(r).toBeDisabled();
  });
});

describe("ExamNavigator", () => {
  const answers = { "q-101": ["2"] as AnswerValue };

  it("shows answered, skipped and unanswered states and the timer", () => {
    render(<ExamNavigator items={items} answers={answers} visited={items.slice(0, 3).map((i) => i.id)} currentId={items[2]!.id} remainingSeconds={125} />);
    expect(screen.getByRole("button", { name: "1번 문항, 답 완료" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2번 문항, 건너뜀" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3번 문항, 미응답" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("02:05");
    expect(screen.getByText("1 / 6 완료")).toBeInTheDocument();
  });

  it("scrolls to the item and reports navigation on click", async () => {
    const onNavigate = vi.fn();
    const scroll = vi.fn();
    render(
      <>
        <ExamNavigator items={items} answers={{}} onNavigate={onNavigate} />
        <ItemRenderer item={byType("matching")} number={4} />
      </>,
    );
    document.getElementById("oe-item-q-103")!.scrollIntoView = scroll;
    await userEvent.click(screen.getByRole("button", { name: "4번 문항, 미응답" }));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("q-103");
  });

  it("formats time and answer presence", () => {
    expect(mmss(0)).toBe("00:00");
    expect(mmss(3599)).toBe("59:59");
    expect(isAnswered("  ")).toBe(false);
    expect(isAnswered({ a: "" })).toBe(false);
    expect(isAnswered(["x"])).toBe(true);
  });
});

describe("AnnotatableText", () => {
  it("merges ranges and splits text into segments", () => {
    expect(mergeRanges([{ start: 5, end: 9 }, { start: 0, end: 3 }, { start: 2, end: 6 }])).toEqual([{ start: 0, end: 9 }]);
    expect(segments("abcdef", [{ start: 1, end: 3 }]).map((s) => [s.text, s.highlighted])).toEqual([["a", false], ["bc", true], ["def", false]]);
  });

  it("highlights the selected text and removes a highlight on tap", async () => {
    const onChange = vi.fn();
    function Demo() {
      const [h, setH] = useState<{ start: number; end: number }[]>([]);
      return <AnnotatableText text="손으로 문장을 따라 쓴다" highlights={h} onHighlightsChange={(r) => { setH(r); onChange(r); }} />;
    }
    render(<Demo />);
    const p = screen.getByLabelText("지문");
    const node = p.firstChild!.firstChild!;
    const range = document.createRange();
    range.setStart(node, 4);
    range.setEnd(node, 7);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    fireEvent.pointerUp(p);
    expect(onChange).toHaveBeenLastCalledWith([{ start: 4, end: 7 }]);
    const mark = screen.getByRole("button", { name: /형광펜 해제/ });
    expect(mark).toHaveTextContent("문장을");
    await userEvent.click(mark);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("button", { name: /형광펜 해제/ })).toBeNull();
  });
});

describe("TestPaperLayout", () => {
  it("puts the passage and palette in a side column before the questions, and makes the passage collapsible", () => {
    const { container } = render(<TestPaperLayout passage={<p>지문 본문</p>} questions={<p>문항들</p>} />);
    const details = container.querySelector("details")!;
    expect(details).toHaveAttribute("open");
    expect(within(details).getByText("지문")).toBeInTheDocument();
    const side = container.querySelector(".oe-paper__side")!;
    const questions = container.querySelector(".oe-paper__questions")!;
    expect(side.contains(details)).toBe(true);
    expect(side.compareDocumentPosition(questions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("stacks on narrow screens and goes two-column from 640px up (CSS contract)", () => {
    const css = readFileSync(join(import.meta.dirname, "../src/worksheet/worksheet.css"), "utf8");
    expect(css).toMatch(/\.oe-paper \{[^}]*grid-template-columns: 1fr;/s);
    expect(css).toMatch(/@media \(min-width: 40\.0625rem\)[\s\S]*\.oe-paper\[data-has-side\] \{ grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/);
  });
});
