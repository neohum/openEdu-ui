---
plan: edu-ui-complete-system
status: approved
risk: medium
owner: neohum
---
# Plan: openEdu-ui 완전한 에듀테크 컴포넌트 생태계 구축 및 실시간 테마·수식 아이콘 시스템

## Intent
openEdu-ui를 단순한 개별 교구 데모 수준을 넘어, 현업 교사 및 에듀테크 개발자가 전자칠판 웹앱, 인쇄 학습지/시험지, 학생용 인터랙티브 문제 풀이 뷰어를 완전하게 제작할 수 있는 표준 교육 전용 UI 컴포넌트 시스템으로 완성한다.
현업 교육 콘텐츠(수능, 초·중·고 교과서, 방과후 학습지, 수행평가)의 표준 양식을 전수 조사하여 1) 범용 UI 프리미티브, 2) 전자칠판 수업 도구, 3) 종이학습지 평면 컴포넌트, 4) 수업 진행 필수 도구(시계/타이머/룰렛/차임벨), 5) 5대 테마 및 커스텀 컬러 피커, 6) 평가 및 문제지 전용 문항 컴포넌트, 7) 수식 기호 및 교육 도구 아이콘 세트를 제공한다.

## Research & Requirements Analysis

### 1. 교육 콘텐츠 양식 분석 (학습지, 시험지, 수업 활동)
- **인적사항 영역**: 학교명, 학년, 반, 번호, 이름, 점수, 확인 도장란이 가로 1열 또는 헤더 박스 형태로 반드시 필요함.
- **문항 구성 패턴**:
  - 문항 번호(대형 볼드 숫자 또는 원문자 ①), 배점 뱃지(`[3.5점]`), 문항 지시문, `<보기>` 상자, 선다지 또는 주관식 답안칸.
  - 서술형 문항: 단계별 채점 기준(1단계 배점, 2단계 배점)과 모눈/줄글 풀이 공간 필요.
  - 절취선: 1일 단원평가 등에서 학부모 확인용 또는 교사 채점용으로 하단 절취(`✂️ [절취선]`) 요구.
- **수학 교과서 및 수식 입력 양식**:
  - 컴퓨터 슬래시(`1/2`, `x^2`, `sqrt(x)`) 입력 대신 시각적 수학 기호(세로 분수, 거듭제곱 첨자, 제곱근 근호, 각도, 삼각형, 평행선 등) 툴바가 필수.
- **전자칠판 및 교실 현장 도구**:
  - 교사가 수업 중 직관적으로 시간을 제어하는 타이머, 모둠별 발표자 추첨, 주의 집중 차임벨이 상시 필요함.

### 2. 테마 및 디자인 다양성 요구
- **칠판 다크(Chalkboard Dark)**: 눈부심 방지 및 아날로그 분필 감성 (교실 전자칠판 주 사용)
- **화이트 클린(Paper Light)**: A4 흑백/컬러 인쇄 및 일반 모니터용 명도 높은 레이아웃
- **트렌디 네온(Trendy Violet)**: 최신 classbook 스타일의 몰입감 있는 인터페이스
- **에코 에메랄드(Nature Emerald)**: 눈이 편안한 그린 에듀테크 테마
- **웜 앰버(Sunset Amber)**: 집중도를 높이는 따뜻한 골드 앰버 테마
- **자유 커스텀(Custom Hex/HSL)**: 기관/학교의 고유 아이덴티티 컬러(학교 상징색 등)를 원클릭으로 UI 전체에 주입.

## Architecture & Component Taxonomy

### 계층 1: 기본 UI 프리미티브 (`@openedu/react/primitives`)
- `Button`: 사이즈(`sm`/`md`/`lg`/`board`), 변형(`solid`/`outline`/`ghost`/`glass`), 로딩 상태
- `Input` / `Textarea`: 교실 터치 친화적 패딩 및 포커스 링
- `Select` / `Dropdown`: 커스텀 드롭다운 및 네이티브 선택 지원
- `Checkbox` / `RadioGroup`: 큰 터치 영역(44px+) 및 키보드 접근성
- `Switch`: 직관적인 토글 스위치 (소리 켜기/끄기, 타이머 모드 등)
- `Slider`: 정밀 수치 조절기 (폰트 크기, 브러시 굵기, 스포트라이트 반경 등)
- `Badge` / `Tag`: 배점, 난이도, 상태, 정답/오답 표시 배지
- `Tabs`: 가로/세로 탭 내비게이션
- `Accordion` / `Collapsible`: 해설 접기/펼치기, 문항 힌트 보기
- `Dialog` / `Modal` / `Drawer`: 전체화면 와이드 뷰어 및 사이드 설정 드로어
- `Tooltip`: 도구 설명 툴팁
- `ColorPicker`: HEX/RGB/프리셋 컬러 피커 컴포넌트

### 계층 2: 전자칠판 전용 컴포넌트 (`@openedu/react/board`)
- `BoardHeader`: 교시 인디케이터(1교시~6교시), 과목명, 단원명, 시계 결합 헤더
- `FloatingToolbar`: 글래스모피즘 플로팅 도크 (상/하/좌/우 배치, 최소화 탭)
- `PenPalette`: 분필/펜 5색, 형광펜, 레이저 포인터, 브러시 굵기 칩
- `EraserControl`: 부분 지우개, 획 지우개, 손바닥(Palm) 자동 지우개 모드, 전체 삭제
- `SplitBoardController`: 2분할/3분할 화면 및 가변 비율 조절 바
- `BoardCanvas`: 래디얼 도트, 5mm 모눈, 음악 5선지, 영어 4선지, 원고지 배경 선택 칠판

### 계층 3: 종이학습지 평면 컴포넌트 (`@openedu/react/worksheet` & `@openedu/print`)
- `StudentInfoStrip`: [학교 / 학년 / 반 / 번호 / 이름 / 점수 / 확인] 인적사항 기재 헤더
- `ExamTitleHeader`: 과목명, 단원명, 평가명, 제한시간 및 유의사항 안내 박스
- `GridAnswerBox`: 5mm/10mm 수학 계산용 모눈종이 풀이 박스
- `LinedAnswerBox`: 서술형 논술 풀이용 줄노트 박스 (줄 수 조절 가능)
- `ManuscriptBox`: 200자/400자 원고지 풀이 박스
- `PassageBox`: `<보기>`, `[자료 1]`, `[지문]` 박스 (음영, 테두리 스타일)
- `ScoreBadge`: `[3점]`, `[서술형 10점]` 등 문항 배점 라벨
- `CheckScoreGrid`: 문항별 정답/오답 채점표 및 서명란
- `CutLine`: 가위 절취선 (`✂️ [절취선] 채점 후 학생 확인용`)
- `AnswerBlank`: 인라인 괄호 `(     )` 및 밑줄 빈칸

### 계층 4: 수업 도구 컴포넌트 (`@openedu/react/tools`)
- `ClassroomClock`: 아날로그 시계 + 디지털 시계 + 수업 교시 인디케이터
- `ClassroomTimer`: 카운트다운 타이머 + 스톱워치 (1분/3분/5분/10분 원클릭 퀵 프리셋 + 소리/시각 플래시)
- `RandomPicker`: 발표자/모둠 추첨 룰렛 및 무작위 번호 뽑기
- `AttentionBell`: 수업 집중 알림 차임벨 (실로폰/종소리 오디오 피드백)
- `GroupScoreBoard`: 1모둠~6모둠 점수 카운터 (+1, -1 점수판)

### 계층 5: 교육 평가 & 문제지 제작 전용 문항 컴포넌트 (`@openedu/react/worksheet`)
- `MultipleChoiceItem`: 4/5지선다형 (원문자 ①~⑤, 1줄/2열/수직 정렬)
- `BlankFillItem`: 단답형 빈칸 채우기
- `DescriptiveItem`: 단계별 부분 점수 및 채점 루브릭 포함 서술형
- `MatchingItem`: SVG 드래그/클릭 선 잇기
- `OrderingItem`: 카드 순서 재배열 및 번호 부여
- `TrueFalseItem`: O/X 도장형 진위 판정
- `MathEquationItem`: 분수/근호/첨자 포함 수식 문항
- `TwoColumnExamLayout`: 좌단 지문 / 우단 문항 2단 분할 레이아웃
- `OmrSheetCard`: OMR 마킹 시트 뷰어

### 계층 6: 수식 입력 및 교육 도구 아이콘 시스템 (`@openedu/react/icons`)
- `MathSymbolIcon`:
  - `Fraction`: 세로 분수 ($\frac{a}{b}$)
  - `Sqrt`: 제곱근 ($\sqrt{x}$)
  - `Superscript` / `Subscript`: 거듭제곱 / 아래첨자 ($x^2, x_n$)
  - `Parentheses` / `Brackets`: 소괄호/중괄호/대괄호
  - `Integral`: 적분 기호 ($\int$)
  - `Sigma`: 합 기호 ($\sum$)
  - `Infinity`: 무한대 ($\infty$)
  - `Pi`: 파이 ($\pi$)
  - `Trig`: 삼각함수 ($\sin, \cos, \tan$)
  - `Geometry`: 각도($\angle$), 삼각형($\triangle$), 사각형($\square$), 원($\bigcirc$), 평행($\parallel$), 수직($\perp$)
- `EduIcon`:
  - 교실/수업: 시계, 타이머, 차임벨, 룰렛, 주사위, 확성기, 모둠
  - 필기/교구: 펜, 형광펜, 지우개, 컴퍼스, 삼각자, 각도기, 수모형, 분수띠, 수직선
  - 인쇄/평가: 프린트, 가위, 도장(참 잘했어요, 확인), 점수, OMR

### 계층 7: 실시간 테마 & 컬러 커스터마이저 (`@openedu/react/theme` & 개발지원센터 플레이그라운드)
- `EduThemeProvider`: CSS 변수 기반 동적 테마 주입 컨텍스트
- **5대 내장 테마 프리셋**:
  1. `chalkboard`: 칠판 딥그린 (`#0f291e`), 분필 화이트/옐로우/스카이
  2. `paper`: 화이트보드 & A4 인쇄용 클린 화이트 (`#ffffff`), 잉크 블랙/네이비
  3. `violet`: classbook 현대적 바이올렛 네온 (`#0f172a` 배경, `#8b5cf6` 액센트)
  4. `emerald`: 네이처 에듀 에메랄드 (`#064e3b` 배경, `#10b981` 액센트)
  5. `amber`: 집중형 웜 앰버 (`#1c1917` 배경, `#f59e0b` 액센트)
- `ThemeCustomizerWidget`:
  - 프리셋 원클릭 스위치
  - 컬러 피커(Primary Color, Accent Color, Canvas Bg Color)
  - 다크/라이트 모드 원클릭 토글
  - 실시간으로 플레이그라운드 내 모든 컴포넌트(전자칠판, 문제지, 시계, 학습지)에 즉각 반영!

## File Layout Sketch
- `packages/react/src/primitives/badge.tsx`, `switch.tsx`, `slider.tsx`, `select.tsx`, `tabs.tsx`, `color-picker.tsx`
- `packages/react/src/board/board-header.tsx`, `board-canvas.tsx`
- `packages/react/src/tools/classroom-clock.tsx`, `classroom-timer.tsx`, `random-picker.tsx`, `attention-bell.tsx`, `score-board.tsx`
- `packages/react/src/worksheet/student-info-strip.tsx`, `exam-title-header.tsx`, `grid-answer-box.tsx`, `lined-answer-box.tsx`, `manuscript-box.tsx`, `passage-box.tsx`, `cut-line.tsx`, `omr-sheet-card.tsx`
- `packages/react/src/icons/math-symbol-icons.tsx`, `edu-icons.tsx`
- `packages/react/src/theme/theme-provider.tsx`, `theme-presets.ts`
- `web_service/src/components/docs/playground/ThemeCustomizerWidget.tsx`
- `web_service/src/components/docs/playground/ClassroomToolsViewer.tsx`
- `web_service/src/components/docs/playground/PaperWorksheetViewer.tsx`
- `web_service/src/components/docs/playground/MathSymbolToolbarViewer.tsx`

## Non-goals
- 복잡한 수식 전용 CAS(Computer Algebra System) 기호 연산 엔진 구현 (수식 UI 표현 및 입력 툴바에 집중)
- 3D 물리 시뮬레이션 엔진 (표준 2D/2.5D 및 평면 교구 표현에 집중)

## Steps

### Step 1: edu-primitives-and-theme-engine
- Goal: 범용 UI 프리미티브(Badge, Switch, Slider, Select, Tabs, ColorPicker) 및 CSS 변수 기반 동적 테마 시스템(`EduThemeProvider`, 5대 프리셋) 구현.
- Files: packages/react/src/primitives/badge.tsx, packages/react/src/primitives/switch.tsx, packages/react/src/primitives/slider.tsx, packages/react/src/primitives/select.tsx, packages/react/src/primitives/tabs.tsx, packages/react/src/primitives/color-picker.tsx, packages/react/src/theme/theme-provider.tsx, packages/react/src/theme/theme-presets.ts
- Acceptance: AC-1: Badge, Switch, Slider, Select, Tabs, ColorPicker가 올바르게 렌더링되고 마우스/터치로 상호작용한다 | AC-2: EduThemeProvider를 통해 5대 테마(라이트, 칠판 다크, 바이올렛, 에메랄드, 앰버) 및 임의의 커스텀 헥스 색상이 CSS 변수로 동적 반영된다 | AC-3: axe 접근성 검사 위반 0건 유지
- Tests: pnpm --filter @openedu/react test -- primitives theme
- Risk: low
- Complexity: medium

### Step 2: classroom-tools-suite
- Goal: 전자칠판 및 수업 진행에 필수적인 시계, 타이머(카운트다운/스톱워치), 발표자 룰렛, 집중 차임벨, 모둠 점수판 컴포넌트 개발.
- Files: packages/react/src/tools/classroom-clock.tsx, packages/react/src/tools/classroom-timer.tsx, packages/react/src/tools/random-picker.tsx, packages/react/src/tools/attention-bell.tsx, packages/react/src/tools/score-board.tsx
- Acceptance: AC-1: ClassroomClock이 현재 로컬 시간(아날로그/디지털)과 설정된 수업 교시를 정확하게 표시한다 | AC-2: ClassroomTimer가 1/3/5/10분 프리셋과 사용자 지정 분/초로 카운트다운하고 만료 시 알림 효과를 트리거한다 | AC-3: RandomPicker가 명단에서 무작위 학생/모둠을 애니메이션과 함께 공정하게 추첨한다 | AC-4: AttentionBell 및 GroupScoreBoard가 직관적인 사운드/점수 증감 인터랙션을 제공한다
- Tests: pnpm --filter @openedu/react test -- tools
- Risk: low
- Complexity: medium

### Step 3: paper-worksheet-components
- Goal: 종이 학습지 및 시험지 제작에 필요한 평면 컴포넌트(인적사항 헤더, 모눈종이, 줄노트, 원고지, 지문/보기 박스, 배점 뱃지, 가위 절취선, 채점 O/X 표) 개발.
- Files: packages/react/src/worksheet/student-info-strip.tsx, packages/react/src/worksheet/exam-title-header.tsx, packages/react/src/worksheet/grid-answer-box.tsx, packages/react/src/worksheet/lined-answer-box.tsx, packages/react/src/worksheet/manuscript-box.tsx, packages/react/src/worksheet/passage-box.tsx, packages/react/src/worksheet/cut-line.tsx, packages/react/src/worksheet/omr-sheet-card.tsx
- Acceptance: AC-1: StudentInfoStrip에 학교/학년/반/번호/이름/점수 기재란이 깔끔하게 렌더링된다 | AC-2: GridAnswerBox, LinedAnswerBox, ManuscriptBox가 지정된 규격(5mm 모눈, 줄 간격, 원고지 칸)에 맞게 벡터 그리드로 렌더링된다 | AC-3: PassageBox와 CutLine이 인쇄 및 화면 모두에서 정밀한 레이아웃을 유지한다
- Tests: pnpm --filter @openedu/react test -- worksheet-paper
- Risk: low
- Complexity: medium

### Step 4: math-icons-and-symbol-system
- Goal: 수식 입력을 위한 기호 세트(분수, 근호, 첨자, 시그마, 적분, 기하 기호) 및 교육 도구 아이콘 컴포넌트 세트 구축.
- Files: packages/react/src/icons/math-symbol-icons.tsx, packages/react/src/icons/edu-icons.tsx
- Acceptance: AC-1: MathSymbolIcon에서 분수, 제곱근, 거듭제곱, 적분, 시그마 등 주요 수학 기호 아이콘이 선명한 SVG로 렌더링된다 | AC-2: EduIcon이 Flaticon UIcons Regular Rounded 표준 규격에 맞게 모든 교육 도구(시계, 자, 컴퍼스, 도장 등)를 일관되게 제공한다
- Tests: pnpm --filter @openedu/react test -- icons
- Risk: low
- Complexity: low

### Step 5: dev-portal-integration-and-live-preview
- Goal: 개발지원센터(edulinker.kr/docs)에 신규 컴포넌트군(수업 도구, 종이 학습지 컴포넌트, 수식 툴바, 실시간 테마 커스터마이저) 뷰어를 탑재하고 실서버 배포 및 검증 완료.
- Files: web_service/src/components/docs/playground/ThemeCustomizerWidget.tsx, web_service/src/components/docs/playground/ClassroomToolsViewer.tsx, web_service/src/components/docs/playground/PaperWorksheetViewer.tsx, web_service/src/components/docs/playground/MathSymbolToolbarViewer.tsx, web_service/src/lib/docs/manifest.ts, web_service/src/lib/docs/content.ts
- Acceptance: AC-1: 개발지원센터 플레이그라운드에서 테마 커스터마이저로 라이트, 칠판 다크, 바이올렛, 에메랄드, 앰버 및 원하는 커스텀 색상으로 실시간 변경하여 확인할 수 있다 | AC-2: 수업 도구(시계, 타이머, 룰렛, 차임벨) 및 종이 학습지 컴포넌트를 브라우저에서 직접 조작할 수 있다 | AC-3: pnpm test 100% 통과 및 Next.js 프로덕션 빌드 성공 후 Railway 실서버에 무중단 배포된다
- Tests: pnpm --filter web-service build && pnpm --filter web-service test
- Risk: medium
- Complexity: medium
