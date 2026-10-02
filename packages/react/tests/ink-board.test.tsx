import { createRef } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInkEngine, type InkState } from "@openedu/ink";
import {
  InkBoard,
  InkCanvas,
  resolveInkColor,
  type InkBoardHandle,
} from "../src/index.ts";

const runAxe = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

afterEach(() => {
  vi.useRealTimers();
});

describe("InkCanvas", () => {
  it("attaches canvas to host element and detaches on unmount", () => {
    const engine = createInkEngine();
    const attachSpy = vi.spyOn(engine, "attach");
    const detachSpy = vi.spyOn(engine, "detach");

    const { unmount } = render(<InkCanvas engine={engine} />);
    expect(attachSpy).toHaveBeenCalledTimes(1);
    expect(detachSpy).toHaveBeenCalledTimes(0);

    const canvasRegion = screen.getByRole("region", { name: "판서 캔버스" });
    expect(canvasRegion).toBeInTheDocument();
    expect(canvasRegion.querySelector("canvas")).toBeInTheDocument();

    unmount();
    expect(detachSpy).toHaveBeenCalledTimes(1);
  });

  it("supports readOnly mode and custom label", () => {
    const engine = createInkEngine();
    render(<InkCanvas engine={engine} readOnly label="읽기 전용 판서" />);
    const region = screen.getByRole("region", { name: "읽기 전용 판서" });
    expect(region).toHaveAttribute("tabindex", "-1");
  });
});

describe("resolveInkColor", () => {
  it("returns fallback hex when element or style is not available", () => {
    expect(resolveInkColor(null, 1)).toBe("#1e293b"); // lint-ignore
    expect(resolveInkColor(null, 2)).toBe("#2563eb"); // lint-ignore
  });
});

describe("InkBoard", () => {
  it("renders with default bottom toolbar and accessible elements", () => {
    render(<InkBoard label="전자칠판 판서" />);
    expect(screen.getByRole("group", { name: "전자칠판 판서" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "판서 도구" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "판서 캔버스" })).toBeInTheDocument();
  });

  it("supports top toolbar placement", () => {
    const { container } = render(<InkBoard toolbarPlacement="top" />);
    const toolbarContainer = container.querySelector(".oe-ink-board__toolbar-container--top");
    expect(toolbarContainer).toBeInTheDocument();
  });

  it("hides toolbar when toolbarPlacement is none", () => {
    render(<InkBoard toolbarPlacement="none" />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "판서 캔버스" })).toBeInTheDocument();
  });

  it("hides toolbar and sets readonly styling when readOnly is true", () => {
    const { container } = render(<InkBoard readOnly />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    expect(container.querySelector(".oe-ink-board--readonly")).toBeInTheDocument();
  });

  it("updates tool, size, and color on engine when user interacts with toolbar", async () => {
    const user = userEvent.setup();
    const engine = createInkEngine();
    const setToolSpy = vi.spyOn(engine, "setTool");
    const setSizeSpy = vi.spyOn(engine, "setSize");
    const setColorSpy = vi.spyOn(engine, "setColor");

    render(<InkBoard engine={engine} />);

    // Click highlighter
    await user.click(screen.getByRole("button", { name: "형광펜" }));
    expect(setToolSpy).toHaveBeenCalledWith("highlighter");

    // Click size radio 8
    await user.click(screen.getByRole("radio", { name: "굵기 8" }));
    expect(setSizeSpy).toHaveBeenCalledWith(8);

    // Click color radio 3
    await user.click(screen.getByRole("radio", { name: "색상 3" }));
    expect(setColorSpy).toHaveBeenCalled();
  });

  it("forwards handle methods via ref", async () => {
    const ref = createRef<InkBoardHandle>();
    render(<InkBoard ref={ref} />);

    expect(ref.current).not.toBeNull();
    const handle = ref.current!;
    expect(typeof handle.clear).toBe("function");
    expect(typeof handle.undo).toBe("function");
    expect(typeof handle.redo).toBe("function");
    expect(typeof handle.getState).toBe("function");
    expect(typeof handle.load).toBe("function");

    const state: InkState = { version: 1, strokes: [] };
    act(() => {
      handle.load(state);
    });
    expect(handle.getState()).toEqual(state);

    act(() => {
      handle.clear();
      handle.undo();
      handle.redo();
    });
  });

  it("calls onChange when strokes change", () => {
    const onChange = vi.fn();
    const engine = createInkEngine();
    render(<InkBoard engine={engine} onChange={onChange} />);

    act(() => {
      engine.beginStroke({ x: 10, y: 10, pressure: 0.5, t: 0 });
      engine.extendStroke({ x: 20, y: 20, pressure: 0.5, t: 10 });
      engine.endStroke();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        version: 1,
        strokes: expect.arrayContaining([
          expect.objectContaining({
            tool: "pen",
          }),
        ]),
      }),
    );
  });

  it("satisfies axe accessibility rules", async () => {
    const { container } = render(<InkBoard label="수업 판서" />);
    expect(await runAxe(container)).toEqual([]);
  });

  it("renders export button in toolbar", () => {
    render(<InkBoard label="수업 판서" />);
    expect(screen.getByRole("button", { name: "내보내기" })).toBeInTheDocument();
  });

  it("exports drawing as PNG, calls onExport and triggers file download", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    const mockBlob = new Blob(["png-data"], { type: "image/png" });
    const engine = createInkEngine();
    vi.spyOn(engine, "toBlob").mockResolvedValue(mockBlob);

    const createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-url-123");
    const revokeObjectURLSpy = vi.fn();
    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    let clickedDownload = "";
    let clickedHref = "";
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clickedDownload = this.download;
      clickedHref = this.href;
    });

    render(<InkBoard engine={engine} onExport={onExport} />);

    const exportBtn = screen.getByRole("button", { name: "내보내기" });
    await user.click(exportBtn);

    expect(engine.toBlob).toHaveBeenCalledWith("image/png");
    expect(onExport).toHaveBeenCalledWith(mockBlob);
    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    expect(clickedDownload).toBe("openedu-drawing.png");
    expect(clickedHref).toBe("blob:mock-url-123");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url-123");

    clickSpy.mockRestore();
  });

  it("supports custom exportFilename", async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(["png-data"], { type: "image/png" });
    const engine = createInkEngine();
    vi.spyOn(engine, "toBlob").mockResolvedValue(mockBlob);

    const createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-custom-url");
    const revokeObjectURLSpy = vi.fn();
    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    let clickedDownload = "";
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clickedDownload = this.download;
    });

    render(<InkBoard engine={engine} exportFilename="science-notes.png" />);

    await user.click(screen.getByRole("button", { name: "내보내기" }));

    expect(clickedDownload).toBe("science-notes.png");
    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-custom-url");

    clickSpy.mockRestore();
  });
});
