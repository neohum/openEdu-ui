import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, Card, Cluster, Dialog, Grid, IconButton, Input, Stack, Tooltip } from "../src/index.ts";

async function violations(container: Element) {
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`);
}

describe("Button", () => {
  it.each(["primary", "secondary", "ghost", "danger"] as const)("renders the %s variant", (variant) => {
    render(<Button variant={variant}>저장</Button>);
    expect(screen.getByRole("button", { name: "저장" })).toHaveAttribute("data-variant", variant);
  });

  it("supports sm and md sizes, defaulting to md and type=button", () => {
    const { rerender } = render(<Button>a</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    rerender(<Button size="sm">a</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
  });

  it("is reachable by keyboard and activates with Enter", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>저장</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the label in the DOM while loading so width stays stable, and blocks clicks", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>저장</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
    expect(btn.querySelector(".oe-button__label")).toHaveTextContent("저장");
    expect(btn.querySelector(".oe-spinner")).not.toBeNull();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("IconButton", () => {
  it("uses a fi-rr icon and the label as its accessible name", () => {
    render(<IconButton icon="cross" label="닫기" />);
    const btn = screen.getByRole("button", { name: "닫기" });
    expect(btn.querySelector("i.fi.fi-rr-cross")).not.toBeNull();
    expect(btn.querySelector("svg")).toBeNull();
  });
});

describe("Input", () => {
  it("throws when rendered without a label", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    // @ts-expect-error label is required
    expect(() => render(<Input />)).toThrow(/label/);
    spy.mockRestore();
  });

  it("wires label, hint and error through aria attributes", () => {
    render(<Input label="이름" hint="실명을 입력" error="필수 항목입니다" />);
    const input = screen.getByLabelText("이름");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const described = input.getAttribute("aria-describedby")!.split(" ");
    expect(described).toHaveLength(2);
    expect(document.getElementById(described[1]!)).toHaveTextContent("필수 항목입니다");
  });
});

describe("Layout", () => {
  it("applies space-token gaps", () => {
    render(
      <>
        <Stack data-testid="s" gap={6} />
        <Cluster data-testid="c" />
        <Grid data-testid="g" minColumn="12rem" />
      </>,
    );
    expect(screen.getByTestId("s").style.gap).toBe("var(--space-6)");
    expect(screen.getByTestId("c").style.gap).toBe("var(--space-3)");
    expect(screen.getByTestId("g").style.getPropertyValue("--oe-grid-min")).toBe("12rem");
  });
});

function DialogDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen} title="정답 확인" description="제출하면 수정할 수 없습니다.">
      <Button>제출</Button>
    </Dialog>
  );
}

describe("Dialog and Tooltip", () => {
  it("opens with a title, closes via the close button", async () => {
    render(<DialogDemo />);
    expect(screen.getByRole("dialog", { name: "정답 확인" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows tooltip text on focus", async () => {
    render(<Tooltip label="도움말"><Button>?</Button></Tooltip>);
    await userEvent.tab();
    expect((await screen.findAllByText("도움말")).length).toBeGreaterThan(0);
  });
});

describe("accessibility (axe)", () => {
  it("has no violations for a composed form", async () => {
    const { container } = render(
      <Card>
        <Stack>
          <Input label="이름" />
          <Input label="이메일" error="형식이 올바르지 않습니다" />
          <Cluster>
            <Button>저장</Button>
            <Button variant="secondary">취소</Button>
            <IconButton icon="trash" label="삭제" variant="danger" />
          </Cluster>
        </Stack>
      </Card>,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("has no violations for an open dialog", async () => {
    render(<DialogDemo />);
    expect(await violations(document.body)).toEqual([]);
  });
});
