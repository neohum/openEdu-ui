import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CheckScoreGrid,
  CutLine,
  ExamTitleHeader,
  GridAnswerBox,
  LinedAnswerBox,
  ManuscriptBox,
  OmrSheetCard,
  PassageBox,
  ScoreBadge,
  StudentInfoStrip,
} from "../src/index.ts";

describe("Paper Worksheet Components", () => {
  describe("1. StudentInfoStrip", () => {
    it("renders horizontal mode with student details and score/stamp", () => {
      render(
        <StudentInfoStrip
          mode="horizontal"
          values={{
            school: "서울초등학교",
            grade: 4,
            classNum: 2,
            number: 15,
            name: "김철수",
            score: 95,
            confirmed: true,
          }}
        />
      );

      expect(screen.getByTestId("student-info-strip")).toHaveClass(
        "oe-student-info--horizontal"
      );
      expect(screen.getByText("서울초등학교")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("김철수")).toBeInTheDocument();
      expect(screen.getByText("95")).toBeInTheDocument();
      expect(screen.getByText("인")).toBeInTheDocument();
    });

    it("renders boxed mode table structure and hides score/stamp when disabled", () => {
      const { rerender } = render(
        <StudentInfoStrip
          mode="boxed"
          values={{
            school: "한국중학교",
            grade: "2",
            name: "이영희",
            score: "100/100",
            confirmed: "박선생",
          }}
        />
      );

      const strip = screen.getByTestId("student-info-strip");
      expect(strip).toHaveClass("oe-student-info--boxed");
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("한국중학교")).toBeInTheDocument();
      expect(screen.getByText("이영희")).toBeInTheDocument();
      expect(screen.getByText("박선생")).toBeInTheDocument();

      rerender(
        <StudentInfoStrip
          mode="boxed"
          values={{ school: "한국중학교", name: "이영희" }}
          showScore={false}
          showStamp={false}
        />
      );
      expect(screen.queryByText("점수")).not.toBeInTheDocument();
      expect(screen.queryByText("확인")).not.toBeInTheDocument();
    });
  });

  describe("2. ExamTitleHeader", () => {
    it("renders title, subtitle, subject, and assessment badge", () => {
      render(
        <ExamTitleHeader
          title="2026학년도 1학기 단원평가"
          subtitle="기초학력 진단 및 성취도 측정 평가지"
          subject="수학"
          semester="1학기"
          unit="3. 분수의 덧셈과 뺄셈"
          grade="초등학교 4학년"
          assessmentType="unit"
          totalQuestions={20}
          totalScore={100}
          timeLimit={40}
          instructions={[
            "문제를 꼼꼼히 읽고 답을 작성하세요.",
            "풀이 과정은 지정된 풀이란에 정자로 기재하세요.",
          ]}
        />
      );

      expect(screen.getByTestId("exam-title-header")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "2026학년도 1학기 단원평가"
      );
      expect(
        screen.getByText("기초학력 진단 및 성취도 측정 평가지")
      ).toBeInTheDocument();
      expect(screen.getByText("수학")).toBeInTheDocument();
      expect(screen.getByText("단원평가")).toBeInTheDocument();
      expect(screen.getByText("20문항")).toBeInTheDocument();
      expect(screen.getByText("100점")).toBeInTheDocument();
      expect(screen.getByText("40분")).toBeInTheDocument();
      expect(
        screen.getByText("문제를 꼼꼼히 읽고 답을 작성하세요.")
      ).toBeInTheDocument();
    });
  });

  describe("3. GridAnswerBox", () => {
    it("renders SVG grid pattern with custom label and answer footer", () => {
      const { container } = render(
        <GridAnswerBox
          gridSize="8mm"
          rows={10}
          label="풀이 과정을 자세히 쓰시오."
          subGrid={true}
          showAnswerLine={true}
          answerLabel="정답:"
          answerValue="x = 7"
        />
      );

      expect(screen.getByTestId("grid-answer-box")).toBeInTheDocument();
      expect(screen.getByText("풀이 과정을 자세히 쓰시오.")).toBeInTheDocument();
      expect(screen.getByText("정답:")).toBeInTheDocument();
      expect(screen.getByText("x = 7")).toBeInTheDocument();

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(container.querySelectorAll("pattern")).toHaveLength(2); // main pattern + subpattern
    });
  });

  describe("4. LinedAnswerBox", () => {
    it("renders ruled lines with line numbers and handles input changes", async () => {
      const onChange = vi.fn();
      render(
        <LinedAnswerBox
          lineCount={6}
          showLineNumbers={true}
          label="인상 깊은 구절과 그 까닭을 서술하시오."
          onChange={onChange}
        />
      );

      expect(screen.getByTestId("lined-answer-box")).toBeInTheDocument();
      expect(
        screen.getByText("인상 깊은 구절과 그 까닭을 서술하시오.")
      ).toBeInTheDocument();
      expect(screen.getByText("6줄")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();

      const textarea = screen.getByRole("textbox", {
        name: "인상 깊은 구절과 그 까닭을 서술하시오.",
      });
      await userEvent.type(textarea, "책의 주인공이 용기를 낸 장면이 감동적이었다.");
      expect(onChange).toHaveBeenCalled();
      expect(textarea).toHaveValue("책의 주인공이 용기를 낸 장면이 감동적이었다.");
    });
  });

  describe("5. ManuscriptBox", () => {
    it("renders standard Korean 200-character manuscript grid (10 rows x 20 cols)", () => {
      const { container } = render(
        <ManuscriptBox
          charCount={200}
          cols={20}
          label="원고지 쓰기 (200자)"
          showCrossGuides={true}
          showCountMarks={true}
          value="가나다라"
        />
      );

      expect(screen.getByTestId("manuscript-box")).toBeInTheDocument();
      expect(screen.getByText("원고지 쓰기 (200자)")).toBeInTheDocument();
      expect(screen.getByText("200자 (10행 × 20칸)")).toBeInTheDocument();

      // Check cumulative line counters: 20, 40, ... 200
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();

      // Check character placement
      expect(screen.getByText("가")).toBeInTheDocument();
      expect(screen.getByText("라")).toBeInTheDocument();

      // Check crosshairs
      const cellsWithGuides = container.querySelectorAll(
        ".oe-manuscript-box__cell--guided"
      );
      expect(cellsWithGuides.length).toBe(200);
    });
  });

  describe("6. PassageBox", () => {
    it("renders passage box with variants, title, and source citation", () => {
      const { rerender } = render(
        <PassageBox
          variant="default"
          title="<보 기>"
          source="- 고전문학선집, 2026"
        >
          <p>동창이 밝았느냐 노고지리 우지진다.</p>
        </PassageBox>
      );

      const box = screen.getByTestId("passage-box");
      expect(box).toHaveClass("oe-passage-box--default");
      expect(screen.getByText("<보 기>")).toBeInTheDocument();
      expect(
        screen.getByText("동창이 밝았느냐 노고지리 우지진다.")
      ).toBeInTheDocument();
      expect(screen.getByText("- 고전문학선집, 2026")).toBeInTheDocument();

      rerender(
        <PassageBox variant="bordered" title="[자료 1]">
          <span>내용</span>
        </PassageBox>
      );
      expect(screen.getByTestId("passage-box")).toHaveClass(
        "oe-passage-box--bordered"
      );

      rerender(
        <PassageBox variant="dashed" title="[지문]">
          <span>내용</span>
        </PassageBox>
      );
      expect(screen.getByTestId("passage-box")).toHaveClass(
        "oe-passage-box--dashed"
      );
    });
  });

  describe("7. CutLine", () => {
    it("renders horizontal cutline with Flaticon UIcons scissors icon and label", () => {
      render(
        <CutLine
          label="절취선 (채점 후 학생 배부용)"
          orientation="horizontal"
          dashedStyle="dashed"
        />
      );

      const cutLine = screen.getByTestId("cut-line");
      expect(cutLine).toHaveClass("oe-cut-line--horizontal");
      expect(cutLine).toHaveClass("oe-cut-line--dashed");
      expect(screen.getByText("절취선 (채점 후 학생 배부용)")).toBeInTheDocument();

      const icon = cutLine.querySelector(".fi.fi-rr-scissors");
      expect(icon).toBeInTheDocument();
    });

    it("renders vertical dotted cutline", () => {
      render(
        <CutLine
          label="가위 절취선"
          orientation="vertical"
          dashedStyle="dotted"
        />
      );

      const cutLine = screen.getByTestId("cut-line");
      expect(cutLine).toHaveClass("oe-cut-line--vertical");
      expect(cutLine).toHaveClass("oe-cut-line--dotted");
    });
  });

  describe("8. ScoreBadge", () => {
    it("renders score in bracket, pill, and outline variants", () => {
      const { rerender } = render(
        <ScoreBadge score={3} variant="bracket" />
      );

      const badge = screen.getByTestId("score-badge");
      expect(badge).toHaveClass("oe-score-badge--bracket");
      expect(badge).toHaveTextContent("[3점]");

      rerender(<ScoreBadge score={10} label="서술형" variant="bracket" />);
      expect(screen.getByTestId("score-badge")).toHaveTextContent("[서술형 10점]");

      rerender(<ScoreBadge score={4.5} variant="pill" />);
      expect(screen.getByTestId("score-badge")).toHaveClass("oe-score-badge--pill");
      expect(screen.getByTestId("score-badge")).toHaveTextContent("4.5점");

      rerender(<ScoreBadge score={5} label="배점" variant="outline" />);
      expect(screen.getByTestId("score-badge")).toHaveClass("oe-score-badge--outline");
      expect(screen.getByTestId("score-badge")).toHaveTextContent("배점 5점");
    });
  });

  describe("9. CheckScoreGrid", () => {
    it("renders question score table, O/X results, points, and signature", () => {
      const onScoreClick = vi.fn();
      render(
        <CheckScoreGrid
          itemCount={10}
          scores={{ 1: "O", 2: "X", 3: "O", 4: "O" }}
          points={[4, 4, 4, 5, 5, 5, 5, 6, 6, 6]}
          showSignature={true}
          signatureLabel="지도교사 확인"
          signatureDate="2026. 10. 02."
          signatureName="김선생"
          onScoreClick={onScoreClick}
        />
      );

      expect(screen.getByTestId("check-score-grid")).toBeInTheDocument();
      expect(screen.getByText("지도교사 확인")).toBeInTheDocument();
      expect(screen.getByText("2026. 10. 02.")).toBeInTheDocument();
      expect(screen.getByText("김선생")).toBeInTheDocument();

      // Check O and X marks
      expect(screen.getAllByText("O")).toHaveLength(3);
      expect(screen.getByText("X")).toBeInTheDocument();

      // Check interactive score click
      const item1Cell = screen.getByLabelText("1번 문항 채점 결과: O");
      fireEvent.click(item1Cell);
      expect(onScoreClick).toHaveBeenCalledWith(1);
    });
  });

  describe("10. OmrSheetCard", () => {
    it("renders 20 questions with 5-choice ovals and handles click marking simulation", async () => {
      const onAnswerChange = vi.fn();
      render(
        <OmrSheetCard
          questionCount={20}
          choiceCount={5}
          studentInfo={{ examId: "202604", name: "홍길동" }}
          onAnswerChange={onAnswerChange}
        />
      );

      expect(screen.getByTestId("omr-sheet-card")).toBeInTheDocument();
      expect(screen.getByText("OMR 답안지")).toBeInTheDocument();
      expect(screen.getByText("202604")).toBeInTheDocument();
      expect(screen.getByText("홍길동")).toBeInTheDocument();

      // Check radio bubbles for question 1
      const q1Choice3 = screen.getByRole("radio", { name: "1번 3번 보기" });
      expect(q1Choice3).not.toHaveAttribute("data-marked");

      // Click to mark
      await userEvent.click(q1Choice3);
      expect(q1Choice3).toHaveAttribute("data-marked", "true");
      expect(onAnswerChange).toHaveBeenCalledWith(1, 3, { 1: 3 });

      // Click again to unmark
      await userEvent.click(q1Choice3);
      expect(q1Choice3).not.toHaveAttribute("data-marked");
      expect(onAnswerChange).toHaveBeenCalledWith(1, 0, {});
    });

    it("respects readOnly and controlled answers", () => {
      render(
        <OmrSheetCard
          questionCount={5}
          answers={{ 1: 2, 2: 4 }}
          readOnly={true}
        />
      );

      const q1Choice2 = screen.getByRole("radio", { name: "1번 2번 보기" });
      expect(q1Choice2).toHaveAttribute("data-marked", "true");
      expect(q1Choice2).toBeDisabled();

      const q2Choice4 = screen.getByRole("radio", { name: "2번 4번 보기" });
      expect(q2Choice4).toHaveAttribute("data-marked", "true");
    });
  });
});
