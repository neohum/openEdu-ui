import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ColorFigure } from "../src/manipulatives/color-figure.tsx";

describe("ColorFigure Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders iframe when srcDoc is provided with security sandbox", () => {
    render(
      <ColorFigure
        srcDoc="<html><body><div>Isometric Figure</div></body></html>"
        title="세탁기 내부 원리"
      />
    );

    const figure = screen.getByTestId("color-figure");
    expect(figure).toBeInTheDocument();
    expect(figure).toHaveAttribute("data-surface", "board");

    const iframe = screen.getByTestId("color-figure-iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("sandbox", "allow-scripts allow-same-origin");
    expect(iframe).toHaveAttribute("srcdoc", "<html><body><div>Isometric Figure</div></body></html>");
  });

  it("renders iframe when external src URL is provided", () => {
    render(
      <ColorFigure
        src="https://cdn.openedu.kr/figures/vending-machine.html"
        title="자판기 메커니즘"
      />
    );

    const iframe = screen.getByTestId("color-figure-iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://cdn.openedu.kr/figures/vending-machine.html");
  });

  it("renders fallback UI when neither src nor srcDoc is provided", () => {
    render(<ColorFigure title="빈 교구" />);

    const fallback = screen.getByTestId("color-figure-fallback");
    expect(fallback).toBeInTheDocument();
    expect(screen.getByText("교구 콘텐츠를 표시할 수 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("none")).not.toBeInTheDocument();
  });

  it("renders 56px touch-friendly control bar with rotate, see-through, labels, and zoom buttons", () => {
    render(<ColorFigure srcDoc="<p>Test</p>" title="교구 조작 테스트" />);

    const toolbar = screen.getByRole("toolbar", { name: "교구 조작 테스트 조작 도구" });
    expect(toolbar).toBeInTheDocument();

    const rotateBtn = screen.getByRole("button", { name: "360도 회전" });
    const seeThroughBtn = screen.getByRole("button", { name: "투시 모드" });
    const labelsBtn = screen.getByRole("button", { name: "부품 라벨" });
    const zoomInBtn = screen.getByRole("button", { name: "확대" });
    const zoomOutBtn = screen.getByRole("button", { name: "축소" });
    const zoomResetBtn = screen.getByRole("button", { name: "원래 크기" });

    expect(rotateBtn).toBeInTheDocument();
    expect(seeThroughBtn).toBeInTheDocument();
    expect(labelsBtn).toBeInTheDocument();
    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(zoomResetBtn).toBeInTheDocument();

    // 초기 상태 검증
    expect(rotateBtn).toHaveAttribute("aria-pressed", "false");
    expect(seeThroughBtn).toHaveAttribute("aria-pressed", "false");
    expect(labelsBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles see-through mode and triggers onAction callback", () => {
    const onAction = vi.fn();
    render(<ColorFigure srcDoc="<p>Test</p>" onAction={onAction} />);

    const seeThroughBtn = screen.getByRole("button", { name: "투시 모드" });
    expect(seeThroughBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(seeThroughBtn);
    expect(seeThroughBtn).toHaveAttribute("aria-pressed", "true");
    expect(onAction).toHaveBeenCalledWith("toggle-seethrough", { seeThrough: true });

    fireEvent.click(seeThroughBtn);
    expect(seeThroughBtn).toHaveAttribute("aria-pressed", "false");
    expect(onAction).toHaveBeenCalledWith("toggle-seethrough", { seeThrough: false });
  });

  it("toggles labels mode and triggers onAction callback", () => {
    const onAction = vi.fn();
    render(<ColorFigure srcDoc="<p>Test</p>" onAction={onAction} defaultLabels={true} />);

    const labelsBtn = screen.getByRole("button", { name: "부품 라벨" });
    expect(labelsBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(labelsBtn);
    expect(labelsBtn).toHaveAttribute("aria-pressed", "false");
    expect(onAction).toHaveBeenCalledWith("toggle-labels", { labels: false });
  });

  it("toggles rotation mode and triggers onAction callback", () => {
    const onAction = vi.fn();
    render(<ColorFigure srcDoc="<p>Test</p>" onAction={onAction} />);

    const rotateBtn = screen.getByRole("button", { name: "360도 회전" });
    expect(rotateBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(rotateBtn);
    expect(rotateBtn).toHaveAttribute("aria-pressed", "true");
    expect(onAction).toHaveBeenCalledWith("toggle-rotate", { isRotating: true });
  });

  it("handles zoom level changes and reset", () => {
    const onAction = vi.fn();
    render(<ColorFigure srcDoc="<p>Test</p>" onAction={onAction} />);

    const zoomInBtn = screen.getByRole("button", { name: "확대" });
    const zoomResetBtn = screen.getByRole("button", { name: "원래 크기" });

    expect(screen.getByText("100%")).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(onAction).toHaveBeenCalledWith("zoom", { level: 110 });

    fireEvent.click(zoomResetBtn);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(onAction).toHaveBeenCalledWith("zoom-reset", { level: 100 });
  });

  it("supports controlled seeThrough and labels props", () => {
    const { rerender } = render(
      <ColorFigure srcDoc="<p>Test</p>" seeThrough={false} labels={false} />
    );

    const seeThroughBtn = screen.getByRole("button", { name: "투시 모드" });
    const labelsBtn = screen.getByRole("button", { name: "부품 라벨" });

    expect(seeThroughBtn).toHaveAttribute("aria-pressed", "false");
    expect(labelsBtn).toHaveAttribute("aria-pressed", "false");

    rerender(<ColorFigure srcDoc="<p>Test</p>" seeThrough={true} labels={true} />);
    expect(seeThroughBtn).toHaveAttribute("aria-pressed", "true");
    expect(labelsBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("applies surface styling token presets (board, desktop, mobile)", () => {
    const { rerender } = render(<ColorFigure srcDoc="<p>Test</p>" surface="board" />);
    expect(screen.getByTestId("color-figure")).toHaveAttribute("data-surface", "board");

    rerender(<ColorFigure srcDoc="<p>Test</p>" surface="desktop" />);
    expect(screen.getByTestId("color-figure")).toHaveAttribute("data-surface", "desktop");

    rerender(<ColorFigure srcDoc="<p>Test</p>" surface="mobile" />);
    expect(screen.getByTestId("color-figure")).toHaveAttribute("data-surface", "mobile");
  });

  it("receives postMessage from iframe and dispatches onAction", () => {
    const onAction = vi.fn();
    render(<ColorFigure srcDoc="<p>Test</p>" onAction={onAction} />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            source: "colorfigure",
            action: "inspect-part",
            payload: { partId: "gear-box", name: "감속 기어 박스" },
          },
        })
      );
    });

    expect(onAction).toHaveBeenCalledWith("inspect-part", {
      partId: "gear-box",
      name: "감속 기어 박스",
    });
  });

  it("hides loading skeleton when iframe load event is triggered", () => {
    render(<ColorFigure srcDoc="<p>Test</p>" title="로딩 테스트" />);

    // 로딩 오버레이 존재 확인
    expect(screen.getByRole("status")).toBeInTheDocument();

    const iframe = screen.getByTestId("color-figure-iframe");
    fireEvent.load(iframe);

    // 로딩 오버레이 해제 확인
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("transitions to fallback state on iframe error event", () => {
    render(<ColorFigure src="https://invalid-asset.test/figure.html" title="에러 테스트" />);

    const iframe = screen.getByTestId("color-figure-iframe");
    fireEvent.error(iframe);

    expect(screen.getByTestId("color-figure-fallback")).toBeInTheDocument();
  });
});
