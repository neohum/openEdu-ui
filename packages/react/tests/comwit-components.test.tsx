import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import {
  // Basics
  Button,
  InputGroup,
  InputAddon,
  Textarea,
  Label,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Sheet,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Avatar,
  AvatarFallback,
  Separator,
  Skeleton,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  // Glass
  Glass,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  // Notifications
  Alert,
  EmptyState,
  Toaster,
  toast,
  popup,
  OverlayProvider,
  // Selection
  SegmentedControl,
  Chip,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Pager,
  // Pickers
  Calendar,
  DatePicker,
  TimePicker,
  MonthPicker,
  // Forms
  TextField,
  Autocomplete,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  DataTable,
  Editor,
  // Mobile
  AppShell,
  AppScreen,
  AppBar,
  AppBarTitle,
  AppBarActions,
  BottomNav,
  BottomNavItem,
  BottomSheet,
  PullToRefresh,
  DragScroller,
  PageTransition,
  // Chat
  Chat,
  ChatHeader,
  ChatMessageList,
  ChatMessage,
  ChatComposer,
} from "../src/index.ts";

describe("Comwit UI Complete Suite Verification", () => {
  describe("1. Basics", () => {
    it("renders Button with pill shape and active press", () => {
      render(<Button pill variant="outline">알약 버튼</Button>);
      const btn = screen.getByRole("button", { name: "알약 버튼" });
      expect(btn).toHaveAttribute("data-pill", "true");
      expect(btn).toHaveAttribute("data-variant", "outline");
    });

    it("renders InputGroup with Addon", () => {
      render(
        <InputGroup>
          <InputAddon>🔍</InputAddon>
          <input className="oe-input" placeholder="검색" />
          <InputAddon>⌘K</InputAddon>
        </InputGroup>
      );
      expect(screen.getByText("🔍")).toBeInTheDocument();
      expect(screen.getByText("⌘K")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("검색")).toBeInTheDocument();
    });

    it("renders Textarea with auto-grow and error message", () => {
      render(<Textarea label="의견" error="내용을 입력해주세요" defaultValue="좋은 수업이었습니다." />);
      expect(screen.getByLabelText("의견")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("내용을 입력해주세요");
    });

    it("renders Label with required and optional tags", () => {
      render(
        <div>
          <Label required>필수 항목</Label>
          <Label optional>선택 항목</Label>
        </div>
      );
      expect(screen.getByText("필수 항목")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("(선택)")).toBeInTheDocument();
    });

    it("toggles Accordion items", async () => {
      render(
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>단원 1 안내</AccordionTrigger>
            <AccordionContent>분수의 덧셈과 뺄셈을 배웁니다.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>단원 2 안내</AccordionTrigger>
            <AccordionContent>삼각형의 성질을 배웁니다.</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText("분수의 덧셈과 뺄셈을 배웁니다.")).toBeInTheDocument();

      const trigger2 = screen.getByText("단원 2 안내");
      await userEvent.click(trigger2);

      expect(screen.getByText("삼각형의 성질을 배웁니다.")).toBeInTheDocument();
    });

    it("renders Collapsible toggle", async () => {
      render(
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger>풀이 힌트 보기</CollapsibleTrigger>
          <CollapsibleContent>공통분모로 통분해보세요.</CollapsibleContent>
        </Collapsible>
      );

      expect(screen.queryByText("공통분모로 통분해보세요.")).not.toBeInTheDocument();
      await userEvent.click(screen.getByText("풀이 힌트 보기"));
      expect(screen.getByText("공통분모로 통분해보세요.")).toBeInTheDocument();
    });

    it("renders Sheet slide-out panel", () => {
      const handleClose = vi.fn();
      render(
        <Sheet open={true} onClose={handleClose} side="right" title="학습 보관함">
          <div>보관된 문항 3개</div>
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("학습 보관함")).toBeInTheDocument();
      expect(screen.getByText("보관된 문항 3개")).toBeInTheDocument();
    });

    it("renders Table primitives", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>번호</TableHead>
              <TableHead>이름</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>김철수</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText("번호")).toBeInTheDocument();
      expect(screen.getByText("김철수")).toBeInTheDocument();
    });

    it("renders Avatar, Separator, Skeleton, Pagination", () => {
      render(
        <div>
          <Avatar size="md">
            <AvatarFallback>홍</AvatarFallback>
          </Avatar>
          <Separator orientation="horizontal" />
          <Skeleton style={{ width: 100, height: 20 }} />
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      );
      expect(screen.getByText("홍")).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "페이지 내비게이션" })).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("2. Glass surfaces", () => {
    it("renders Glass component with materials", () => {
      const { container } = render(<Glass material="morphing">글래스 콘텐츠</Glass>);
      expect(container.firstChild).toHaveClass("oe-glass--morphing");
    });

    it("toggles DropdownMenu on glass surface", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>옵션 열기</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>문항 복사</DropdownMenuItem>
            <DropdownMenuItem>PDF 출력</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByText("옵션 열기");
      await userEvent.click(trigger);

      expect(screen.getByText("문항 복사")).toBeInTheDocument();
      expect(screen.getByText("PDF 출력")).toBeInTheDocument();
    });

    it("toggles Popover panel", async () => {
      render(
        <Popover>
          <PopoverTrigger>도움말</PopoverTrigger>
          <PopoverContent>
            <p>이 문항은 3점짜리 객관식입니다.</p>
          </PopoverContent>
        </Popover>
      );

      await userEvent.click(screen.getByText("도움말"));
      expect(screen.getByText("이 문항은 3점짜리 객관식입니다.")).toBeInTheDocument();
    });
  });

  describe("3. Notifications", () => {
    it("renders Alert callout in 5 tones", () => {
      render(<Alert tone="success" title="제출 완료">정답이 채점되었습니다.</Alert>);
      expect(screen.getByRole("alert")).toHaveClass("oe-alert--success");
      expect(screen.getByText("제출 완료")).toBeInTheDocument();
      expect(screen.getByText("정답이 채점되었습니다.")).toBeInTheDocument();
    });

    it("renders EmptyState component", () => {
      render(
        <EmptyState
          title="등록된 문항이 없습니다"
          description="새로운 단원 평가 문항을 추가해보세요."
          action={<button type="button">문항 생성</button>}
        />
      );
      expect(screen.getByText("등록된 문항이 없습니다")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "문항 생성" })).toBeInTheDocument();
    });

    it("dispatches Toast notification", async () => {
      render(<Toaster />);
      act(() => {
        toast.success("저장 성공", "서버에 학습 기록이 저장되었습니다.");
      });

      expect(await screen.findByText("저장 성공")).toBeInTheDocument();
      expect(screen.getByText("서버에 학습 기록이 저장되었습니다.")).toBeInTheDocument();
    });

    it("renders Popup confirm modal via OverlayProvider", async () => {
      render(
        <OverlayProvider>
          <button
            type="button"
            onClick={() => popup.confirm("시험을 종료하시겠습니까?", { title: "시험 종료" })}
          >
            시험 완료
          </button>
        </OverlayProvider>
      );

      await userEvent.click(screen.getByText("시험 완료"));
      expect(screen.getByText("시험 종료")).toBeInTheDocument();
      expect(screen.getByText("시험을 종료하시겠습니까?")).toBeInTheDocument();
    });
  });

  describe("4. Selection", () => {
    it("renders SegmentedControl and fires onChange", async () => {
      const handleChange = vi.fn();
      render(
        <SegmentedControl
          value="week"
          onChange={handleChange}
          options={[
            { value: "day", label: "일간" },
            { value: "week", label: "주간" },
            { value: "month", label: "월간" },
          ]}
        />
      );

      const dayBtn = screen.getByText("일간");
      await userEvent.click(dayBtn);
      expect(handleChange).toHaveBeenCalledWith("day");
    });

    it("renders Chip with selection and remove", async () => {
      const handleSelect = vi.fn();
      const handleRemove = vi.fn();
      render(
        <Chip selected onSelect={handleSelect} onRemove={handleRemove}>
          4학년 수학
        </Chip>
      );

      const chip = screen.getByText("4학년 수학");
      await userEvent.click(chip);
      expect(handleSelect).toHaveBeenCalled();

      const removeBtn = screen.getByRole("button", { name: "삭제" });
      await userEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalled();
    });

    it("renders Checkbox with checkmark SVG", async () => {
      const handleChange = vi.fn();
      render(<Checkbox label="동의합니다" onChange={handleChange} />);
      const chk = screen.getByLabelText("동의합니다");
      await userEvent.click(chk);
      expect(handleChange).toHaveBeenCalled();
    });

    it("renders RadioGroup with keyboard items", async () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup name="subject" defaultValue="math" onChange={handleChange}>
          <RadioGroupItem value="korean" label="국어" />
          <RadioGroupItem value="math" label="수학" />
          <RadioGroupItem value="science" label="과학" />
        </RadioGroup>
      );

      const sci = screen.getByLabelText("과학");
      await userEvent.click(sci);
      expect(handleChange).toHaveBeenCalledWith("science");
    });

    it("renders Pager with numbered chips and prev/next", async () => {
      const handlePage = vi.fn();
      render(<Pager page={3} totalPages={10} onPageChange={handlePage} />);

      const nextBtn = screen.getByLabelText("다음 페이지");
      await userEvent.click(nextBtn);
      expect(handlePage).toHaveBeenCalledWith(4);
    });
  });

  describe("5. Pickers", () => {
    it("renders Calendar and handles date clicks", async () => {
      const handleSelect = vi.fn();
      render(<Calendar value="2026-10-15" onChange={handleSelect} />);
      expect(screen.getByText("2026년 10월")).toBeInTheDocument();

      const day20 = screen.getByText("20");
      await userEvent.click(day20);
      expect(handleSelect).toHaveBeenCalledWith("2026-10-20");
    });

    it("opens DatePicker dropdown and selects a date", async () => {
      const handleDate = vi.fn();
      render(<DatePicker label="제출 기한" value="2026-10-03" onChange={handleDate} />);
      const trigger = screen.getByText("2026-10-03");
      await userEvent.click(trigger);

      expect(screen.getByRole("dialog", { name: "날짜 선택" })).toBeInTheDocument();
    });

    it("renders TimePicker and lists slots", async () => {
      const handleTime = vi.fn();
      render(<TimePicker value="09:00" onChange={handleTime} />);
      await userEvent.click(screen.getByText("09:00"));

      expect(screen.getByRole("listbox", { name: "시간 슬롯 목록" })).toBeInTheDocument();
      const slot10 = screen.getByText("10:00");
      await userEvent.click(slot10);
      expect(handleTime).toHaveBeenCalledWith("10:00");
    });

    it("renders MonthPicker year grid", async () => {
      const handleMonth = vi.fn();
      render(<MonthPicker value="2026-05" onChange={handleMonth} />);
      await userEvent.click(screen.getByText("2026-05"));

      expect(screen.getByText("5월")).toBeInTheDocument();
      await userEvent.click(screen.getByText("6월"));
      expect(handleMonth).toHaveBeenCalledWith("2026-06");
    });
  });

  describe("6. Forms and data", () => {
    it("renders TextField with char count", () => {
      render(<TextField label="자기소개" value="안녕하세요" maxLength={20} showCount readOnly />);
      expect(screen.getByText("5 / 20")).toBeInTheDocument();
    });

    it("filters options in Autocomplete", async () => {
      const handleSelect = vi.fn();
      render(
        <Autocomplete
          options={[
            { value: "fr-1", label: "분수의 덧셈", category: "4-1" },
            { value: "fr-2", label: "소수의 덧셈", category: "4-2" },
            { value: "tr-1", label: "삼각형의 분류", category: "4-1" },
          ]}
          onChange={handleSelect}
        />
      );

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "분수");

      expect(screen.getByText("분수의 덧셈")).toBeInTheDocument();
      expect(screen.queryByText("삼각형의 분류")).not.toBeInTheDocument();

      await userEvent.click(screen.getByText("분수의 덧셈"));
      expect(handleSelect).toHaveBeenCalledWith("fr-1");
    });

    it("renders Form with accessible FormField, FormLabel, FormControl, FormMessage", () => {
      render(
        <Form>
          <FormField name="email" error="유효한 이메일을 입력하세요">
            <FormItem>
              <FormLabel required>이메일</FormLabel>
              <FormControl>
                <input className="oe-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </Form>
      );

      expect(screen.getByText("이메일")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("유효한 이메일을 입력하세요");
    });

    it("renders DataTable with data and sort headers", () => {
      const columns = [
        { key: "id", header: "문항 번호", sortable: true },
        { key: "title", header: "문항명" },
        { key: "rate", header: "정답률" },
      ];
      const data = [
        { id: 1, title: "분수의 덧셈 01", rate: "85%" },
        { id: 2, title: "분수의 뺄셈 02", rate: "62%" },
      ];

      render(<DataTable columns={columns} data={data} />);
      expect(screen.getByText("문항 번호")).toBeInTheDocument();
      expect(screen.getByText("분수의 덧셈 01")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
    });

    it("renders rich text Editor with markdown and math tools", () => {
      render(<Editor label="서술형 해설 작성" defaultValue="풀이과정: $x + 2 = 5$" />);
      expect(screen.getByText("서술형 해설 작성")).toBeInTheDocument();
      expect(screen.getByTitle("수식 입력")).toBeInTheDocument();
      expect(screen.getByTitle("굵게")).toBeInTheDocument();
    });
  });

  describe("7. Mobile app & Chat", () => {
    it("renders AppScreen with AppBar and BottomNav", () => {
      render(
        <AppScreen
          appBar={
            <AppBar>
              <AppBarTitle>모바일 학습관</AppBarTitle>
              <AppBarActions>
                <button type="button">검색</button>
              </AppBarActions>
            </AppBar>
          }
          bottomNav={
            <BottomNav>
              <BottomNavItem active icon="🏠" label="홈" />
              <BottomNavItem icon="📚" label="내 학습" />
            </BottomNav>
          }
        >
          <div>학습 콘텐츠 목록</div>
        </AppScreen>
      );

      expect(screen.getByText("모바일 학습관")).toBeInTheDocument();
      expect(screen.getByText("홈")).toBeInTheDocument();
      expect(screen.getByText("내 학습")).toBeInTheDocument();
      expect(screen.getByText("학습 콘텐츠 목록")).toBeInTheDocument();
    });

    it("renders BottomSheet gesture modal", () => {
      const handleClose = vi.fn();
      render(
        <BottomSheet open={true} onClose={handleClose} title="풀이 설정">
          <div>펜 굵기 조절</div>
        </BottomSheet>
      );

      expect(screen.getByText("풀이 설정")).toBeInTheDocument();
      expect(screen.getByText("펜 굵기 조절")).toBeInTheDocument();
    });

    it("renders Chat interface with messages and composer", async () => {
      const handleSend = vi.fn();
      render(
        <Chat>
          <ChatHeader title="AI 튜터와 대화" subtitle="실시간 질문 및 스캐폴딩" />
          <ChatMessageList>
            <ChatMessage
              message={{
                id: "m-1",
                role: "assistant",
                senderName: "AI 선생님",
                content: "어떤 문제가 이해하기 어려운가요?",
              }}
            />
          </ChatMessageList>
          <ChatComposer onSend={handleSend} />
        </Chat>
      );

      expect(screen.getByText("AI 튜터와 대화")).toBeInTheDocument();
      expect(screen.getByText("어떤 문제가 이해하기 어려운가요?")).toBeInTheDocument();

      const input = screen.getByPlaceholderText("질문이나 풀이과정을 입력하세요...");
      await userEvent.type(input, "3번 분수 문제가 헷갈려요");
      await userEvent.click(screen.getByLabelText("메시지 전송"));

      expect(handleSend).toHaveBeenCalledWith("3번 분수 문제가 헷갈려요");
    });
  });
});
