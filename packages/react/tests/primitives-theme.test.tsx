import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Badge,
  type BadgeVariant,
  type BadgeSize,
  Switch,
  Slider,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ColorPicker,
  DEFAULT_EDU_PRESETS,
  EduThemeProvider,
  useEduTheme,
  THEME_PRESETS,
} from "../src/index.ts";

async function checkAxeViolations(container: Element) {
  const result = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  return result.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`
  );
}

describe("Badge primitive", () => {
  const variants: BadgeVariant[] = [
    "default",
    "secondary",
    "outline",
    "score",
    "success",
    "destructive",
  ];

  it.each(variants)("renders %s variant correctly", (variant) => {
    render(<Badge variant={variant}>{variant} 뱃지</Badge>);
    const badge = screen.getByText(`${variant} 뱃지`);
    expect(badge).toHaveAttribute("data-variant", variant);
    expect(badge).toHaveAttribute("data-size", "md");
  });

  const sizes: BadgeSize[] = ["sm", "md", "lg"];

  it.each(sizes)("renders %s size correctly", (size) => {
    render(<Badge size={size}>크기 테스트</Badge>);
    const badge = screen.getByText("크기 테스트");
    expect(badge).toHaveAttribute("data-size", size);
  });
});

describe("Switch primitive", () => {
  it("renders with default props and handles toggle click", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="알림 설정" onCheckedChange={onCheckedChange} />);

    const switchBtn = screen.getByRole("switch", { name: "알림 설정" });
    expect(switchBtn).toHaveAttribute("aria-checked", "false");
    expect(switchBtn).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(switchBtn);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("supports keyboard toggle using Space and Enter", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="소리 켜기" onCheckedChange={onCheckedChange} />);

    const switchBtn = screen.getByRole("switch", { name: "소리 켜기" });
    switchBtn.focus();
    expect(switchBtn).toHaveFocus();

    // Space key
    await userEvent.keyboard(" ");
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    // Enter key
    await userEvent.keyboard("{Enter}");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects controlled checked state and disabled property", async () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch checked={true} disabled label="비활성 스위치" onCheckedChange={onCheckedChange} />
    );

    const switchBtn = screen.getByRole("switch", { name: "비활성 스위치" });
    expect(switchBtn).toHaveAttribute("aria-checked", "true");
    expect(switchBtn).toBeDisabled();

    await userEvent.click(switchBtn);
    expect(onCheckedChange).not.toHaveBeenCalled();

    rerender(<Switch checked={false} label="비활성 스위치" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});

describe("Slider primitive", () => {
  it("renders slider with min, max, value and label", () => {
    render(<Slider label="볼륨" min={0} max={100} step={5} value={40} />);
    const slider = screen.getByRole("slider", { name: "볼륨" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("handles keyboard ArrowUp/Right and ArrowDown/Left adjustments", async () => {
    const onChange = vi.fn();
    render(<Slider label="밝기" min={0} max={100} step={10} value={50} onChange={onChange} />);

    const slider = screen.getByRole("slider", { name: "밝기" });
    slider.focus();

    // ArrowRight (+step)
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(60);

    // ArrowUp (+step)
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(60);

    // ArrowLeft (-step)
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(40);

    // ArrowDown (-step)
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(40);

    // Home (min)
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(0);

    // End (max)
    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenCalledWith(100);
  });
});

describe("Select primitive", () => {
  const options = [
    { value: "math", label: "수학" },
    { value: "korean", label: "국어" },
    { value: "science", label: "과학" },
  ];

  it("renders select options with placeholder", () => {
    render(<Select label="과목 선택" placeholder="과목을 선택하세요" options={options} />);
    expect(screen.getByRole("combobox", { name: "과목 선택" })).toBeInTheDocument();
    expect(screen.getByText("과목을 선택하세요")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "수학" })).toBeInTheDocument();
  });

  it("triggers onChange when user selects an option", async () => {
    const onChange = vi.fn();
    render(<Select label="과목 선택" options={options} defaultValue="math" onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: "과목 선택" });
    await userEvent.selectOptions(select, "science");

    expect(onChange).toHaveBeenCalledWith("science");
  });
});

describe("Tabs primitive", () => {
  function TabsTestComponent() {
    return (
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">1단계</TabsTrigger>
          <TabsTrigger value="tab2">2단계</TabsTrigger>
          <TabsTrigger value="tab3">3단계</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">1단계 콘텐츠</TabsContent>
        <TabsContent value="tab2">2단계 콘텐츠</TabsContent>
        <TabsContent value="tab3">3단계 콘텐츠</TabsContent>
      </Tabs>
    );
  }

  it("renders tabs and switches active panel on trigger click", async () => {
    render(<TabsTestComponent />);

    const tab1 = screen.getByRole("tab", { name: "1단계" });
    const tab2 = screen.getByRole("tab", { name: "2단계" });

    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(tab2).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("1단계 콘텐츠")).toBeInTheDocument();
    expect(screen.queryByText("2단계 콘텐츠")).toBeNull();

    await userEvent.click(tab2);
    expect(tab1).toHaveAttribute("aria-selected", "false");
    expect(tab2).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("2단계 콘텐츠")).toBeInTheDocument();
  });

  it("navigates tabs using keyboard ArrowRight and ArrowLeft", async () => {
    render(<TabsTestComponent />);

    const tab1 = screen.getByRole("tab", { name: "1단계" });
    const tab2 = screen.getByRole("tab", { name: "2단계" });
    const tab3 = screen.getByRole("tab", { name: "3단계" });

    tab1.focus();
    expect(tab1).toHaveFocus();

    // ArrowRight to next tab
    await userEvent.keyboard("{ArrowRight}");
    expect(tab2).toHaveFocus();
    expect(tab2).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("2단계 콘텐츠")).toBeInTheDocument();

    // ArrowRight again
    await userEvent.keyboard("{ArrowRight}");
    expect(tab3).toHaveFocus();
    expect(tab3).toHaveAttribute("aria-selected", "true");

    // ArrowLeft back to tab2
    await userEvent.keyboard("{ArrowLeft}");
    expect(tab2).toHaveFocus();
    expect(tab2).toHaveAttribute("aria-selected", "true");
  });
});

describe("ColorPicker primitive", () => {
  it("renders 10 educational presets and updates on chip click", async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="테마 색상" defaultValue="#0f291e" onChange={onChange} />);

    expect(DEFAULT_EDU_PRESETS).toHaveLength(10);
    // Find chip for 에코 에메랄드 (#10b981)
    const emeraldChip = screen.getByRole("button", { name: /에메랄드/ });
    expect(emeraldChip).toBeInTheDocument();

    await userEvent.click(emeraldChip);
    expect(onChange).toHaveBeenCalledWith("#10b981");
  });

  it("updates color when hex text is typed", async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="색상" defaultValue="#0f291e" onChange={onChange} />);

    const input = screen.getByLabelText("색상 HEX 코드");
    await userEvent.clear(input);
    await userEvent.type(input, "#4f46e5");

    expect(onChange).toHaveBeenCalledWith("#4f46e5");
  });
});

describe("EduThemeProvider & useEduTheme", () => {
  function ThemeConsumer() {
    const { theme, setTheme, customAccent, setCustomAccent, preset } = useEduTheme();
    return (
      <div>
        <span data-testid="current-theme">{theme}</span>
        <span data-testid="current-name">{preset?.name}</span>
        <span data-testid="current-accent">{customAccent || preset?.accent}</span>
        <button onClick={() => setTheme("paper")}>화이트로 변경</button>
        <button onClick={() => setCustomAccent("#ff1493")}>커스텀 액센트</button>
      </div>
    );
  }

  it("injects data-theme and CSS variables into the root element", async () => {
    const { container } = render(
      <EduThemeProvider defaultTheme="chalkboard">
        <ThemeConsumer />
      </EduThemeProvider>
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-theme", "chalkboard");
    expect(root.style.getPropertyValue("--oe-theme-bg")).toBe(THEME_PRESETS.chalkboard.bg);
    expect(root.style.getPropertyValue("--oe-theme-fg")).toBe(THEME_PRESETS.chalkboard.fg);
    expect(root.style.getPropertyValue("--oe-theme-accent")).toBe(THEME_PRESETS.chalkboard.accent);
    expect(root.style.getPropertyValue("--oe-theme-surface")).toBe(THEME_PRESETS.chalkboard.surface);

    expect(screen.getByTestId("current-theme")).toHaveTextContent("chalkboard");
    expect(screen.getByTestId("current-name")).toHaveTextContent("칠판 딥그린");

    // Change theme to paper
    await userEvent.click(screen.getByRole("button", { name: "화이트로 변경" }));
    expect(root).toHaveAttribute("data-theme", "paper");
    expect(root.style.getPropertyValue("--oe-theme-bg")).toBe(THEME_PRESETS.paper.bg);
    expect(screen.getByTestId("current-theme")).toHaveTextContent("paper");

    // Set custom accent
    await userEvent.click(screen.getByRole("button", { name: "커스텀 액센트" }));
    expect(root.style.getPropertyValue("--oe-theme-accent")).toBe("#ff1493");
    expect(screen.getByTestId("current-accent")).toHaveTextContent("#ff1493");
  });

  it("throws when useEduTheme is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow(
      "useEduTheme must be used within an EduThemeProvider"
    );
    spy.mockRestore();
  });
});

describe("Accessibility (axe)", () => {
  it("has 0 violations for composed UI with all new primitives and theme", async () => {
    const options = [
      { value: "a", label: "옵션 A" },
      { value: "b", label: "옵션 B" },
    ];

    const { container } = render(
      <EduThemeProvider defaultTheme="chalkboard">
        <main>
          <Badge variant="score">점수: 100</Badge>
          <Switch label="효과음" defaultChecked />
          <Slider label="음량" min={0} max={100} defaultValue={75} />
          <Select label="난이도" options={options} defaultValue="a" />
          <Tabs defaultValue="t1">
            <TabsList>
              <TabsTrigger value="t1">탭 1</TabsTrigger>
              <TabsTrigger value="t2">탭 2</TabsTrigger>
            </TabsList>
            <TabsContent value="t1">
              <p>탭 1 내용</p>
            </TabsContent>
            <TabsContent value="t2">
              <p>탭 2 내용</p>
            </TabsContent>
          </Tabs>
          <ColorPicker label="선택 색상" defaultValue="#10b981" />
        </main>
      </EduThemeProvider>
    );

    expect(await checkAxeViolations(container)).toEqual([]);
  });
});
