import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React from "react";
import {
  ThinAnswerGrid,
  ThinCoordinatePlane,
  ThinPaperExamHeader,
  ThinPaperLayout,
  ThinPaperTelemetryMarker,
  ThinPaperWorksheet,
  ThinPassageBox,
  ThinProblemBox,
  ThinRuledNote,
  ThinScoreBox,
} from "../src/thin-black/index.ts";

describe("Paper Worksheet Thin-Line Black UI", () => {
  it("renders ThinPaperWorksheet with A4 structure and ExamHeader", () => {
    render(
      <ThinPaperWorksheet>
        <ThinPaperExamHeader
          title="2026학년도 1학기 중간평가"
          subject="수학"
          schoolName="한국초등학교"
          grade={4}
          classNum={2}
          studentNumber={15}
          studentName="김철수"
        />
        <div>문제 영역</div>
      </ThinPaperWorksheet>
    );

    expect(screen.getByText("2026학년도 1학기 중간평가")).toBeInTheDocument();
    expect(screen.getByText("수학")).toBeInTheDocument();
    expect(screen.getByText("한국초등학교")).toBeInTheDocument();
    expect(screen.getByText("4학년 2반")).toBeInTheDocument();
    expect(screen.getByText("김철수")).toBeInTheDocument();
  });

  it("renders ThinProblemBox with points, prompt and sub-questions", () => {
    render(
      <ThinProblemBox
        num={3}
        points={4}
        prompt="다음 분수의 덧셈을 계산하시오."
        subQuestions={["2/5 + 1/5 의 값을 구하시오.", "기약분수로 나타내시오."]}
      />
    );

    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText(/다음 분수의 덧셈을 계산하시오/)).toBeInTheDocument();
    expect(screen.getByText("[4점]")).toBeInTheDocument();
    expect(screen.getByText("(1) 2/5 + 1/5 의 값을 구하시오.")).toBeInTheDocument();
    expect(screen.getByText("(2) 기약분수로 나타내시오.")).toBeInTheDocument();
  });

  it("renders ThinPassageBox for reading passages with label and source", () => {
    render(
      <ThinPassageBox label="지문" source="초등 4학년 국어 교과서">
        <p>우리나라의 사계절은 봄, 여름, 가을, 겨울로 뚜렷합니다.</p>
      </ThinPassageBox>
    );

    expect(screen.getByText("[지문]")).toBeInTheDocument();
    expect(screen.getByText(/우리나라의 사계절은/)).toBeInTheDocument();
    expect(screen.getByText("- 초등 4학년 국어 교과서 -")).toBeInTheDocument();
  });

  it("renders ThinScoreBox teacher rubric scoring table", () => {
    render(
      <ThinScoreBox
        rubrics={[
          { criteria: "통분 과정을 바르게 서술함", points: "2점" },
          { criteria: "정확한 덧셈 결과를 도출함", points: "2점" },
        ]}
      />
    );

    expect(screen.getByText("채점 기준")).toBeInTheDocument();
    expect(screen.getByText("통분 과정을 바르게 서술함")).toBeInTheDocument();
    expect(screen.getByText("정확한 덧셈 결과를 도출함")).toBeInTheDocument();
  });

  it("renders ThinAnswerGrid with OMR bubble and blank fill", () => {
    const { rerender } = render(<ThinAnswerGrid type="choice" choiceCount={5} />);
    expect(screen.getByText("답:")).toBeInTheDocument();
    expect(screen.getByText("①")).toBeInTheDocument();
    expect(screen.getByText("⑤")).toBeInTheDocument();

    rerender(<ThinAnswerGrid type="blank" label="정답" />);
    expect(screen.getByText("정답:")).toBeInTheDocument();
  });

  it("renders ThinRuledNote for descriptive math work", () => {
    const { container } = render(
      <ThinRuledNote variant="ruled" label="[ 서술형 풀이 ]" height={150} />
    );
    expect(screen.getByText("[ 서술형 풀이 ]")).toBeInTheDocument();
    expect(container.querySelector(".oe-thin-ruled-lines")).toBeInTheDocument();
  });

  it("renders ThinCoordinatePlane cartesian graph SVG", () => {
    const { container } = render(<ThinCoordinatePlane size={180} gridSteps={4} />);
    const svg = container.querySelector(".oe-thin-plane-svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "180");
  });

  it("renders ThinPaperTelemetryMarker for offline-to-online anonymous scanning", () => {
    render(
      <ThinPaperTelemetryMarker
        anonSessionId="anon_s_7f8a9b"
        worksheetId="WS-MATH-4A"
        pageNumber={1}
        totalPages={2}
      />
    );

    expect(screen.getByText("무기명 분석 코드:")).toBeInTheDocument();
    expect(screen.getByText("anon_s_7f8a9b")).toBeInTheDocument();
    expect(screen.getByText("| WS-MATH-4A")).toBeInTheDocument();
    expect(screen.getByText("- 1 / 2 -")).toBeInTheDocument();
  });

  it("renders ThinPaperLayout in 2-column mode with divider", () => {
    const { container } = render(
      <ThinPaperLayout columns={2}>
        <div>왼쪽 컬럼</div>
        <div>오른쪽 컬럼</div>
      </ThinPaperLayout>
    );

    expect(container.querySelector(".oe-thin-layout--two-col")).toBeInTheDocument();
    expect(container.querySelector(".oe-thin-layout__divider")).toBeInTheDocument();
    expect(screen.getByText("왼쪽 컬럼")).toBeInTheDocument();
    expect(screen.getByText("오른쪽 컬럼")).toBeInTheDocument();
  });
});
