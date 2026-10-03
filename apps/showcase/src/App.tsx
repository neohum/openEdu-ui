import { paper } from "@openedu/content";
import samplePaper from "../../../packages/content/src/samples/paper.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AdaptiveDock,
  Alert,
  AnnotatableText,
  AppBar,
  AppBarActions,
  AppBarTitle,
  AppScreen,
  Autocomplete,
  Avatar,
  AvatarFallback,
  BaseTenBlocks,
  BehaviorObservationBadge,
  BottomNav,
  BottomNavItem,
  BottomSheet,
  Button,
  Calendar,
  Card,
  Chat,
  ChatComposer,
  ChatHeader,
  ChatMessage,
  ChatMessageList,
  Checkbox,
  Chip,
  Cluster,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DataTable,
  DatePicker,
  Dialog,
  DragScroller,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Editor,
  EduTelemetryProvider,
  EmptyState,
  ExamNavigator,
  FocusCurtain,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FractionBar,
  Glass,
  Grid,
  Icon,
  IconButton,
  InkBoard,
  Input,
  InputAddon,
  InputGroup,
  ItemRenderer,
  Label,
  MonthPicker,
  NumberLine,
  ObserverHeatmapStrip,
  OverlayProvider,
  Pager,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PullToRefresh,
  RadialMenu,
  RadioGroup,
  RadioGroupItem,
  SegmentedControl,
  Separator,
  Sheet,
  Skeleton,
  SplitBoard,
  Stack,
  StudentStateDot,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TelemetryEventLogTable,
  TestPaperLayout,
  TextField,
  Textarea,
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
  TimePicker,
  Toaster,
  Tooltip,
  popup,
  toast,
  useEduTelemetry,
  type Answers,
  type EduStudentState,
  type EduTelemetryEvent,
} from "@openedu/react";
import { useEffect, useState } from "react";

const SURFACES = ["board", "desktop", "mobile", "print"] as const;
type Surface = (typeof SURFACES)[number];
const SWATCHES = [
  "bg",
  "surface",
  "surface-sunken",
  "fg",
  "fg-muted",
  "border",
  "accent",
  "danger",
  "success",
  "edu-focus",
  "edu-scaffold",
  "edu-mastery",
  "edu-feedback",
  "edu-explore",
  "edu-calm",
] as const;

const data = paper.parse(samplePaper);

function useParam<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T
): [T, (v: T) => void] {
  const read = () => {
    const v = new URLSearchParams(window.location.search).get(name) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  };
  const [value, setValue] = useState<T>(read);
  const set = (v: T) => {
    const url = new URL(window.location.href);
    url.searchParams.set(name, v);
    window.history.replaceState(null, "", url);
    setValue(v);
  };
  return [value, set];
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sc-section">
      <div>
        <h2 className="sc-section__title">{title}</h2>
        {subtitle && (
          <p style={{ color: "var(--color-fg-muted)", fontSize: "0.95rem", margin: "4px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// Interactive Telemetry Tracking Box for Showcase
function InteractiveStudentProblem() {
  const { anonId, telemetryProps, recordAction } = useEduTelemetry({
    component: "InteractiveMathItem",
    targetId: "prob-01",
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSelect = (val: string) => {
    setSelectedOption(val);
    const isCorrect = val === "C";
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isCorrect) {
      recordAction("solve_success", "mastery", { attempts: nextAttempts });
      toast.success("정답입니다!", "개념을 완벽하게 이해했습니다.");
    } else {
      recordAction("retry", nextAttempts >= 2 ? "struggle" : "focus", { attempts: nextAttempts });
      toast.warning("다시 생각해보세요", "힌트가 필요하면 아래 힌트 버튼을 눌러보세요.");
    }
  };

  const handleHint = () => {
    recordAction("hint_request", "struggle", { reason: "student_requested_hint" });
    popup.alert("분모가 같을 때는 분자끼리 더합니다. (예: 1/5 + 2/5 = 3/5)", "스캐폴딩 힌트");
  };

  return (
    <Card {...telemetryProps}>
      <Stack gap={3}>
        <Cluster justify="space-between">
          <Cluster gap={2}>
            <span style={{ fontWeight: 700 }}>[무기명 수집 문항]</span>
            <code style={{ fontSize: "0.8rem", background: "var(--color-surface-sunken)", padding: "2px 6px", borderRadius: 4 }}>
              {anonId}
            </code>
          </Cluster>
          <StudentStateDot state={selectedOption === "C" ? "mastery" : attempts >= 2 ? "struggle" : "focus"} />
        </Cluster>
        <p style={{ margin: 0, fontWeight: 500 }}>
          다음 식의 계산 결과를 고르시오: <b>2/7 + 3/7 = ?</b>
        </p>
        <Cluster gap={2}>
          {["A: 5/14", "B: 6/49", "C: 5/7", "D: 1"].map((choice) => {
            const code = choice.split(":")[0] ?? "";
            return (
              <Button
                key={choice}
                variant={selectedOption === code ? "primary" : "secondary"}
                pill
                onClick={() => handleSelect(code)}
              >
                {choice}
              </Button>
            );
          })}
        </Cluster>
        <Cluster justify="space-between">
          <Button variant="ghost" size="sm" onClick={handleHint}>
            💡 힌트 요청 (스캐폴딩)
          </Button>
          <span style={{ fontSize: "0.8rem", color: "var(--color-fg-muted)" }}>
            시도 횟수: {attempts}회
          </span>
        </Cluster>
      </Stack>
    </Card>
  );
}

export function App() {
  const [surface, setSurface] = useParam<Surface>("surface", SURFACES, "desktop");
  const [theme, setTheme] = useParam<"light" | "dark">("theme", ["light", "dark"], "light");

  useEffect(() => {
    document.documentElement.dataset.surface = surface;
    document.documentElement.dataset.theme = theme;
  }, [surface, theme]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [highlights, setHighlights] = useState<{ start: number; end: number }[]>([]);
  const [count, setCount] = useState(7);

  // Comwit UI showcase states
  const [segValue, setSegValue] = useState("week");
  const [chipSelected, setChipSelected] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radioVal, setRadioVal] = useState("math");
  const [pagerPage, setPagerPage] = useState(1);
  const [dateVal, setDateVal] = useState("2026-10-03");
  const [timeVal, setTimeVal] = useState("10:00");
  const [monthVal, setMonthVal] = useState("2026-10");
  const [telemetryEvents, setTelemetryEvents] = useState<EduTelemetryEvent[]>([]);

  // Sample cohort distribution for heatmap
  const cohortDistribution: Partial<Record<EduStudentState, number>> = {
    focus: 18,
    explore: 6,
    struggle: 4,
    overload: 1,
    mastery: 9,
    idle: 2,
  };

  return (
    <OverlayProvider>
      <Toaster position="top-right" />
      <EduTelemetryProvider onEvent={(evt) => setTelemetryEvents((prev) => [evt, ...prev].slice(0, 15))}>
        <div className="sc-page">
          <header className="sc-header">
            <a className="sc-brand" href="/" aria-label="openEdu-ui">
              <img src="/favicon.svg" alt="" className="sc-logo" />
              <span className="sc-wordmark">
                open<span className="sc-wordmark__edu">Edu</span>-ui
              </span>
            </a>
            <Cluster gap={2} role="group" aria-label="표면 선택">
              {SURFACES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === surface ? "primary" : "secondary"}
                  aria-pressed={s === surface}
                  onClick={() => setSurface(s)}
                >
                  {s}
                </Button>
              ))}
            </Cluster>
            <IconButton
              icon={theme === "light" ? "moon" : "sun"}
              label={theme === "light" ? "다크 테마" : "라이트 테마"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            />
          </header>

          <main className="sc-main">
            {/* 1. Pedagogical & Behavioral Color System */}
            <Section
              title="1. 교육학적 색채 & 행동 관찰 시스템"
              subtitle="인지 부하 이론(CLT), 정의적 여과 가설, 시각 피로 완화 및 실시간 행동 상태 관찰 체계"
            >
              <div className="sc-swatches">
                {SWATCHES.map((name) => (
                  <div key={name} className="sc-swatch">
                    <span
                      className="sc-swatch__chip"
                      style={{ background: `var(--color-${name})` }}
                    />
                    <code>{name}</code>
                  </div>
                ))}
              </div>

              <Grid minColumn="18rem">
                <Card>
                  <Stack gap={2}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      행동 관찰 배지 (실시간 상태)
                    </span>
                    <Cluster gap={2}>
                      <BehaviorObservationBadge state="focus" />
                      <BehaviorObservationBadge state="explore" />
                      <BehaviorObservationBadge state="struggle" />
                      <BehaviorObservationBadge state="overload" />
                      <BehaviorObservationBadge state="mastery" />
                      <BehaviorObservationBadge state="idle" />
                    </Cluster>
                  </Stack>
                </Card>

                <Card>
                  <Stack gap={2}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      학급 전체 무기명 몰입 히트맵
                    </span>
                    <ObserverHeatmapStrip distribution={cohortDistribution} totalStudents={40} />
                  </Stack>
                </Card>
              </Grid>
            </Section>

            {/* 2. Anonymous Behavioral Telemetry Simulation */}
            <Section
              title="2. 학생 행동 무기명 데이터 수집 & 관찰"
              subtitle="개인식별정보(Zero-PII) 없이 머무름 시간(Dwell), 망설임(Hesitation), 오답 재시도 횟수를 안전하게 수집"
            >
              <Grid minColumn="22rem">
                <InteractiveStudentProblem />
                <Card>
                  <Stack gap={2}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      실시간 수집 무기명 이벤트 로그 (Zero PII)
                    </span>
                    <TelemetryEventLogTable events={telemetryEvents} maxRows={4} />
                  </Stack>
                </Card>
              </Grid>
            </Section>

            {/* 3. Comwit UI Complete Web Component Suite */}
            <Section
              title="3. Comwit UI 전체 컴포넌트 스위트"
              subtitle="https://library.comwit.io/ui의 8개 범주 48개 컴포넌트 완벽 구현 (Mobile, Glass, Pickers, Selection, Forms, Notifications, Chat)"
            >
              {/* 3.1 Selection & Notifications */}
              <Grid minColumn="20rem">
                <Card>
                  <Stack gap={3}>
                    <span style={{ fontWeight: 700 }}>Selection (선택 컴포넌트)</span>
                    <SegmentedControl
                      value={segValue}
                      onChange={setSegValue}
                      options={[
                        { value: "day", label: "일간" },
                        { value: "week", label: "주간" },
                        { value: "month", label: "월간" },
                      ]}
                    />
                    <Cluster gap={2}>
                      <Chip selected={chipSelected} onSelect={() => setChipSelected(!chipSelected)} onRemove={() => setChipSelected(false)}>
                        4학년 수학
                      </Chip>
                      <Chip>초등 과학</Chip>
                    </Cluster>
                    <Checkbox label="학습 통계 무기명 공유에 동의합니다" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                    <RadioGroup name="subject" value={radioVal} onChange={setRadioVal}>
                      <RadioGroupItem value="korean" label="국어 영역" />
                      <RadioGroupItem value="math" label="수학 영역" />
                    </RadioGroup>
                    <Pager page={pagerPage} totalPages={8} onPageChange={setPagerPage} />
                  </Stack>
                </Card>

                <Card>
                  <Stack gap={3}>
                    <span style={{ fontWeight: 700 }}>Notifications & Glass</span>
                    <Cluster gap={2}>
                      <Button size="sm" onClick={() => toast.success("저장 완료", "학습 데이터가 기록되었습니다.")}>
                        토스트 실행
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => popup.confirm("이 문항을 완료 처리할까요?")}>
                        팝업 실행
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="oe-button" data-variant="secondary" data-size="sm">
                          글래스 메뉴 ▾
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>문항 복제</DropdownMenuItem>
                          <DropdownMenuItem>PDF 출력</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Popover>
                        <PopoverTrigger className="oe-button" data-variant="secondary" data-size="sm">
                          도움말 팝오버
                        </PopoverTrigger>
                        <PopoverContent>
                          <p style={{ margin: 0, fontSize: "0.85rem" }}>
                            문항 해결에 도움이 필요하면 가상 교구를 이용하세요.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </Cluster>

                    <Alert tone="info" title="안내">
                      오늘의 권장 학습량은 5문항입니다.
                    </Alert>
                    <Alert tone="success" title="달성">
                      주간 학습 목표 100%를 달성했습니다!
                    </Alert>
                  </Stack>
                </Card>
              </Grid>

              {/* 3.2 Pickers & Forms */}
              <Grid minColumn="20rem">
                <Card>
                  <Stack gap={3}>
                    <span style={{ fontWeight: 700 }}>Pickers (일시 선택기)</span>
                    <DatePicker label="과제 제출일" value={dateVal} onChange={setDateVal} />
                    <TimePicker label="학습 시간" value={timeVal} onChange={setTimeVal} />
                    <MonthPicker label="학기/회차" value={monthVal} onChange={setMonthVal} />
                  </Stack>
                </Card>

                <Card>
                  <Stack gap={3}>
                    <span style={{ fontWeight: 700 }}>Forms & Data</span>
                    <TextField label="학생 닉네임" defaultValue="용감한 사자" maxLength={15} showCount />
                    <Autocomplete
                      label="교과 단원 검색"
                      options={[
                        { value: "f1", label: "분수의 덧셈과 뺄셈", category: "4-1" },
                        { value: "f2", label: "소수의 덧셈", category: "4-2" },
                        { value: "g1", label: "삼각형의 분류", category: "4-1" },
                      ]}
                    />
                    <Editor label="서술형 풀이 작성" defaultValue="통분하여 $1/2 + 1/3 = 5/6$ 을 구함." minHeight={90} />
                  </Stack>
                </Card>
              </Grid>

              {/* 3.3 Mobile App Shell & Educational Chat Preview */}
              <Grid minColumn="22rem">
                <Card>
                  <Stack gap={3}>
                    <Cluster justify="space-between">
                      <span style={{ fontWeight: 700 }}>Mobile App Shell 프리뷰</span>
                      <Button size="sm" variant="secondary" onClick={() => setBottomSheetOpen(true)}>
                        바텀시트 열기
                      </Button>
                    </Cluster>
                    <div style={{ height: "380px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <AppScreen
                        appBar={
                          <AppBar>
                            <AppBarTitle>모바일 학습관</AppBarTitle>
                            <AppBarActions>
                              <Button size="sm" variant="ghost">설정</Button>
                            </AppBarActions>
                          </AppBar>
                        }
                        bottomNav={
                          <BottomNav>
                            <BottomNavItem active icon="🏠" label="홈" />
                            <BottomNavItem icon="📖" label="문제" />
                            <BottomNavItem icon="📊" label="통계" />
                          </BottomNav>
                        }
                      >
                        <div style={{ padding: "16px" }}>
                          <p style={{ margin: "0 0 12px", fontWeight: 600 }}>가로 슬라이드 레일</p>
                          <DragScroller>
                            {["1단원: 큰 수", "2단원: 각도", "3단원: 곱셈과 나눗셈", "4단원: 평면도형"].map((c) => (
                              <div
                                key={c}
                                style={{
                                  padding: "16px 20px",
                                  background: "var(--color-surface)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "var(--radius-md)",
                                  whiteSpace: "nowrap",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {c}
                              </div>
                            ))}
                          </DragScroller>
                        </div>
                      </AppScreen>
                    </div>
                  </Stack>
                </Card>

                <Card>
                  <Stack gap={2}>
                    <span style={{ fontWeight: 700 }}>Educational Chat (대화형 튜터)</span>
                    <div style={{ height: "380px" }}>
                      <Chat>
                        <ChatHeader title="AI 수학 튜터" subtitle="개념 질의응답 및 풀이 보조" />
                        <ChatMessageList>
                          <ChatMessage
                            message={{
                              id: "1",
                              role: "assistant",
                              senderName: "튜터",
                              content: "안녕하세요! 분수 문제에서 막히는 부분이 있나요?",
                              timestamp: Date.now() - 60000,
                            }}
                          />
                          <ChatMessage
                            message={{
                              id: "2",
                              role: "user",
                              content: "분모가 다른 분수는 어떻게 더하나요?",
                              timestamp: Date.now() - 30000,
                            }}
                          />
                          <ChatMessage
                            message={{
                              id: "3",
                              role: "assistant",
                              senderName: "튜터",
                              content: "분모가 다를 때는 최소공배수를 찾아 통분(공통분모)한 뒤, 분자끼리 더해주면 돼요!",
                              timestamp: Date.now(),
                            }}
                          />
                        </ChatMessageList>
                        <ChatComposer onSend={(text) => toast.info("질문 전송됨", text)} />
                      </Chat>
                    </div>
                  </Stack>
                </Card>
              </Grid>

              <BottomSheet open={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)} title="모바일 제스처 시트">
                <Stack gap={3}>
                  <p style={{ margin: 0, color: "var(--color-fg-muted)" }}>
                    터치로 핸들을 아래로 끌어내리면 부드럽게 닫힙니다.
                  </p>
                  <Button onClick={() => setBottomSheetOpen(false)}>확인 완료</Button>
                </Stack>
              </BottomSheet>
            </Section>

            {/* 4. Paper Worksheet Thin-Line Black UI */}
            <Section
              title="4. 종이 학습지를 위한 얇은 선의 블랙 UI"
              subtitle="0.75pt/0.5pt 헤어라인 흑백 벡터 라인, 무채색 토너 절약, OMR 객관식/서술형 줄노트/좌표평면 및 무기명 QR 연동"
            >
              <ThinPaperWorksheet>
                <ThinPaperExamHeader
                  title="2026학년도 1학기 수학 형성평가"
                  subject="수학 4-1"
                  schoolName="서울초등학교"
                  grade={4}
                  classNum={2}
                  studentNumber={15}
                  studentName="김철수"
                />

                <ThinPaperLayout columns={2}>
                  {/* Left Column */}
                  <div>
                    <ThinProblemBox
                      num={1}
                      points={4}
                      prompt="다음 그림을 보고 색칠된 부분을 분수로 바르게 나타낸 것을 고르시오."
                    >
                      <ThinPassageBox label="보기">
                        전체를 똑같이 6개로 나눈 것 중 4개가 색칠되어 있습니다.
                      </ThinPassageBox>
                      <ThinAnswerGrid type="choice" choiceCount={5} />
                    </ThinProblemBox>

                    <ThinProblemBox
                      num={2}
                      points={5}
                      prompt="직교좌표계 위에 점 A(2, 3)을 표시하고, x축에 대칭인 점 B의 좌표를 구하시오."
                    >
                      <ThinCoordinatePlane size={150} gridSteps={3} />
                      <ThinAnswerGrid type="blank" label="점 B의 좌표" />
                    </ThinProblemBox>
                  </div>

                  {/* Right Column */}
                  <div>
                    <ThinProblemBox
                      num={3}
                      points={6}
                      prompt="[서술형] 다음 두 분수의 크기를 비교하고, 그 풀이 과정을 서술하시오."
                      subQuestions={[
                        "두 분수 3/4과 5/6를 통분하시오.",
                        "어느 분수가 더 큰지 부등호(<, >)를 사용하여 나타내시오.",
                      ]}
                    >
                      <ThinRuledNote variant="ruled" height={130} label="[ 풀이 및 정답란 ]" />
                      <ThinScoreBox
                        maxScore={6}
                        rubrics={[
                          { criteria: "공통분모 12로 바르게 통분함", points: "3점" },
                          { criteria: "올바른 부등호로 크기를 비교함", points: "3점" },
                        ]}
                      />
                    </ThinProblemBox>
                  </div>
                </ThinPaperLayout>

                <ThinPaperTelemetryMarker
                  anonSessionId="anon_s_7f8a9b"
                  worksheetId="OPENEDU-MATH-04"
                  pageNumber={1}
                  totalPages={1}
                />
              </ThinPaperWorksheet>
            </Section>

            {/* Original Showcase Sections (Retained for completeness) */}
            <Section title="기본 컴포넌트">
              <Grid minColumn="20rem">
                <Card>
                  <Stack>
                    <Input label="이름" hint="수업에서 부를 이름" />
                    <Input label="이메일" error="형식이 올바르지 않습니다" />
                    <Cluster>
                      <Button>저장</Button>
                      <Button variant="secondary">취소</Button>
                      <Button variant="danger">삭제</Button>
                      <Button loading>전송</Button>
                    </Cluster>
                  </Stack>
                </Card>
                <Card>
                  <Stack>
                    <Cluster>
                      <Tooltip label="새 문제 추가">
                        <IconButton icon="plus" label="추가" variant="secondary" />
                      </Tooltip>
                      <IconButton icon="pencil-simple" label="수정" variant="secondary" />
                      <IconButton icon="trash" label="삭제" variant="danger" />
                    </Cluster>
                    <Button variant="ghost" onClick={() => setDialogOpen(true)}>
                      <Icon name="info" /> 대화상자 열기
                    </Button>
                  </Stack>
                </Card>
              </Grid>
              <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="정답을 제출할까요?"
                description="제출하면 수정할 수 없습니다."
              >
                <Button onClick={() => setDialogOpen(false)}>제출</Button>
              </Dialog>
            </Section>

            <Section title="문제지">
              <TestPaperLayout
                passage={
                  <AnnotatableText
                    text={data.passages[0]!.content}
                    highlights={highlights}
                    onHighlightsChange={setHighlights}
                  />
                }
                passageLabel={data.passages[0]!.title}
                questions={data.items.slice(0, 2).map((item, i) => (
                  <ItemRenderer
                    key={item.id}
                    item={item}
                    number={i + 1}
                    value={answers[item.id]}
                    onChange={(v) => setAnswers((a) => ({ ...a, [item.id]: v }))}
                  />
                ))}
                navigator={
                  <ExamNavigator
                    items={data.items}
                    answers={answers}
                    visited={data.items.slice(0, 2).map((i) => i.id)}
                    remainingSeconds={1500}
                  />
                }
              />
            </Section>

            <Section title="가상 교구">
              <Grid minColumn="20rem">
                <Card>
                  <BaseTenBlocks value={count} onChange={setCount} />
                </Card>
                <Card>
                  <Stack>
                    <NumberLine min={0} max={10} value={Math.min(count, 10)} onChange={setCount} />
                    <FractionBar denominator={4} defaultValue={3} />
                  </Stack>
                </Card>
              </Grid>
            </Section>

            <Section title="전자칠판">
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY });
                }}
              >
                <InkBoard />
              </div>
              <FocusCurtain label="가림막" defaultValue={0.4}>
                <p className="sc-curtain-content">
                  가림막 뒤에 숨겨진 문제 풀이입니다. 필요한 만큼 드래그해서 확인하세요.
                </p>
              </FocusCurtain>
              <div className="sc-split">
                <SplitBoard
                  zones={2}
                  label="칠판 분할"
                  renderZone={(i) => (
                    <div style={{ padding: 16 }}>{i === 0 ? "왼쪽 판서 영역" : "오른쪽 판서 영역"}</div>
                  )}
                />
              </div>
              <AdaptiveDock label="도구 모음">
                <Cluster gap={2}>
                  <IconButton icon="pencil-simple" label="펜" />
                  <IconButton icon="highlighter" label="형광펜" />
                  <IconButton icon="eraser" label="지우개" />
                  <IconButton icon="projector-screen" label="가림막" />
                  <IconButton icon="columns" label="분할" />
                </Cluster>
              </AdaptiveDock>
              <RadialMenu
                open={menu !== null}
                origin={menu ?? { x: 0, y: 0 }}
                label="빠른 메뉴"
                onClose={() => setMenu(null)}
                onSelect={(id) => {
                  console.log("selected", id);
                  setMenu(null);
                }}
                items={[
                  { id: "pen", label: "펜", icon: "pencil-simple" },
                  { id: "eraser", label: "지우개", icon: "eraser" },
                  { id: "clear", label: "전체 지우기", icon: "trash" },
                ]}
              />
            </Section>
          </main>

          <footer className="sc-footer">
            openEdu-ui — 전자칠판 · 웹 · 앱 · 인터랙티브 콘텐츠 · 종이 학습지를 위한 통합 교육 디자인 시스템
          </footer>
        </div>
      </EduTelemetryProvider>
    </OverlayProvider>
  );
}
