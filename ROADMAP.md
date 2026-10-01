# openEdu-ui 로드맵

## Intent
전자칠판·웹·앱·인터랙티브 콘텐츠·종이 학습지(인쇄)까지 **하나의 디자인 토큰과 하나의 문항 스키마**로 만드는 교육용 디자인 시스템을 만든다. 디자이너 없이도 "표면 프로파일(board / desktop / mobile / print)"만 고르면 간격·글자 크기·터치 타겟이 자동으로 맞춰지고, 같은 문항 JSON이 화면과 종이에서 모두 렌더링되며, 쇼케이스 앱을 production 빌드로 띄워 스크린샷으로 확인할 수 있다.

## 근거 연구 → 설계 원칙 (요약)
| 연구/원칙 | 디자인 시스템에서의 구현 |
| --- | --- |
| 심미적 사용성·게슈탈트 | 4/8pt 스케일 토큰만 허용(`spacing-lint`), 근접성 기반 레이아웃 프리미티브(Stack/Cluster/Grid) |
| 힉·밀러 | 컴포넌트당 Primary 액션 1개 규칙, 문제지 한 화면 1~3문항 + 팔레트 |
| 60-30-10 / Refactoring UI | 시맨틱 컬러 토큰(role 기반), 순수 검정 금지, 보더 대신 표면 명도차 |
| 피츠·도달성(전자칠판) | `board` 프로파일: 터치 타겟 ≥ 64px, 하단 1/3 도크, 좌/우 스냅, 높이 조절 |
| 원거리 가독성 | `board` 프로파일 본문 ≥ 28pt, 고대비 색 블록 |
| 분리 주의 효과 | 지문 고정 + 문항 스크롤(`PassagePane`/`QuestionPane`), 인라인 주석 |
| CPA 모형 | 가상 교구(Virtual Manipulative) 컴포넌트 + 수치 양방향 바인딩 |
| 협력 학습(CSCL) | `SplitBoard` 2~4분할 독립 영역 |
| QTI 3.0 | 문항 스키마를 QTI 부분집합 JSON으로 정의, 렌더러 교체 가능 |

## 설계 결정 (되돌리기 비싼 것만)
1. **토큰이 진실의 원천이다.** 토큰은 JSON(DTCG 형식)으로 정의 → CSS 변수로 빌드. 따라서 React가 아닌 정적 HTML·Vue·종이(인쇄 CSS)도 같은 값을 쓴다.
2. **표면 프로파일 = 토큰 오버라이드 레이어.** `data-surface="board|desktop|mobile|print"` 하나로 스케일(글자·간격·타겟)이 바뀐다. 컴포넌트는 프로파일을 모른다.
3. **1차 구현은 React 19 + TypeScript + CSS(vanilla, `@layer`).** Tailwind/shadcn은 쓰지 않는다: 소비자가 CSS 변수만으로 쓸 수 있어야 하고 `DESIGN.md` 계약과 충돌 없이 가기 위해서다. 헤드리스 접근성은 Radix Primitives를 의존성으로 사용(직접 구현 금지).
4. **아이콘은 Phosphor Icons(MIT) Regular(`ph ph-*`) 단일 표준.** 라이선스 부담 없이 글꼴로 쓸 수 있고, 인라인 SVG·아이콘 혼용은 하지 않는다.
5. **종이 학습지는 별도 기술이 아니라 `print` 프로파일 + 같은 컴포넌트.** `@media print` + CSS Paged Media(`@page`)로 A4 출력, 정답지/학생용 모드 분리.
6. **판서 엔진은 어댑터로만 연결한다.** tldraw/Konva를 코어 의존성으로 넣지 않고 `core`의 `InkLayer` 인터페이스 + 선택 패키지로 분리(번들 크기와 라이선스 격리).
7. **디자인 시스템 계약은 `DESIGN.md`를 갱신하는 것으로 한다.** 현재 `DESIGN.md`의 다크 단일 테마·`space.unit 4px`는 `desktop` 프로파일의 기본값으로 흡수한다.

## 패키지/파일 레이아웃 스케치 (pnpm workspace)
| 경로 | 책임 | 이유 |
| --- | --- | --- |
| `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` | 워크스페이스 루트, 공통 스크립트 | 패키지 간 일관된 typecheck/test/lint |
| `packages/tokens/` | DTCG JSON 토큰 → `tokens.css` 빌드, 표면 프로파일 | 모든 표면의 단일 진실 |
| `packages/core/` | Pointer 라우터(pen/touch/palm), 도달성·스냅 유틸, `InkLayer` 인터페이스 | UI와 무관한 입력 계층 분리 |
| `packages/react/` | 프리미티브·교육 컴포넌트 | 1차 렌더 타깃 |
| `packages/content/` | 문항 스키마(QTI 부분집합), zod 검증, 샘플 문항 | 화면·종이 공용 데이터 |
| `packages/print/` | `@page` CSS, 인쇄 레이아웃, 정답지 모드 | 종이 학습지 |
| `apps/showcase/` | Storybook + 표면별 데모 페이지, 시각 회귀 | Tier 3 증거의 표면 |
| `scripts/ops/spacing-lint.ts` 등 | 토큰 밖 값 차단 린터 | 디자이너 없는 일관성 강제 |

## Non-goals
- 네이티브 모바일(React Native/Flutter) 컴포넌트 — 모바일 앱은 우선 Web(PWA)/Wails·Capacitor 래핑으로 사용
- 완전한 CBT/시험 플랫폼(채점 서버, 응시 관리, 부정행위 방지)
- 문항 저작(Authoring) 도구 UI — 스키마와 렌더러까지만
- 자체 화이트보드 엔진 구현 — tldraw/Konva는 어댑터로 연결만
- QTI 3.0 전체 호환 — 합의된 부분집합(객관식·빈칸·매칭·순서·핫스팟)만
- Vue/Svelte/Web Components 래퍼 — 토큰/CSS가 이식 가능함만 보장
- 다국어 UI — 한국어 기본, 문자열은 props로 주입 가능하게만

## Steps

### Step 1: workspace-scaffold
- Goal: pnpm 워크스페이스, TypeScript, vitest, ESLint 골격을 만들고(쇼케이스는 Step 12에서 Vite 앱으로 추가) `pnpm typecheck`·`pnpm test`가 빈 패키지에서 통과한다
- Files: package.json, pnpm-workspace.yaml, tsconfig.base.json, eslint.config.js, .gitignore, packages/tokens/package.json, packages/core/package.json, packages/react/package.json, packages/content/package.json, packages/print/package.json, apps/showcase/package.json
- Acceptance: AC-1: `pnpm -r typecheck`와 `pnpm -r test`가 exit 0 이다 / AC-2: 루트 `package.json`에 lint·typecheck·test 스크립트가 정의되고 `pnpm lint`가 exit 0 이다
- Tests: pnpm install && pnpm -r typecheck && pnpm -r test

### Step 2: design-tokens
- Goal: DTCG JSON 토큰(컬러 시맨틱 role, 8pt 간격, 타입 스케일, radius, elevation, motion)을 `tokens.css`로 빌드하고 light/dark를 지원한다
- Files: packages/tokens/src/tokens.json, packages/tokens/src/build.ts, packages/tokens/tests/tokens.test.ts, packages/tokens/dist/tokens.css, DESIGN.md
- Acceptance: AC-1: 빌드 산출 CSS에 `--color-bg`, `--color-fg`, `--color-accent`, `--space-1..12`, `--font-size-*`가 존재한다 / AC-2: 순수 `#000000` 토큰이 없고 텍스트 대비가 WCAG AA 이상임을 테스트가 검사한다 / AC-3: `DESIGN.md`가 토큰 표를 새 값으로 갱신한다
- Tests: pnpm --filter @openedu/tokens test

### Step 3: surface-profiles
- Goal: `data-surface="board|desktop|mobile|print"` 선택만으로 글자 크기·간격·터치 타겟 토큰이 바뀐다 (board 본문 ≥ 28pt, 타겟 ≥ 64px / desktop·mobile 타겟 ≥ 44px)
- Files: packages/tokens/src/surfaces.json, packages/tokens/src/build.ts, packages/tokens/tests/surfaces.test.ts, packages/tokens/dist/surfaces.css
- Acceptance: AC-1: 각 프로파일의 `--target-min`, `--font-size-body` 값이 위 하한을 만족한다는 테스트 통과 / AC-2: 프로파일 전환 시 컴포넌트 CSS 수정 없이 변수만 바뀐다(스냅샷 비교)
- Tests: pnpm --filter @openedu/tokens test -- surfaces
- Depends on: design-tokens

### Step 4: spacing-lint
- Goal: 토큰 밖 간격·색·글자 크기 리터럴(`13px`, 임의 hex)을 CSS/TSX에서 찾아 실패시키는 린터를 추가한다 (기존 4/8pt 린터와 통합)
- Files: scripts/ops/spacing-lint.ts, scripts/ops/spacing-lint.test.ts, package.json
- Acceptance: AC-1: 토큰 밖 값이 있는 픽스처에서 exit 1, 토큰만 쓰는 픽스처에서 exit 0 / AC-2: `pnpm lint:tokens`가 `packages/*/src`를 검사한다
- Tests: node --test scripts/ops/spacing-lint.test.ts

### Step 5: core-input-layer
- Goal: Pointer Events 기반 라우터가 pen/touch/palm(큰 접촉면)을 구분하고, 도달성 유틸(좌/우 스냅, 높이 프리셋)과 `InkLayer` 인터페이스를 제공한다
- Files: packages/core/src/pointer-router.ts, packages/core/src/reach.ts, packages/core/src/ink-layer.ts, packages/core/src/index.ts, packages/core/tests/pointer-router.test.ts, packages/core/tests/reach.test.ts
- Acceptance: AC-1: pen 입력은 `ink` 이벤트, touch는 `ui` 이벤트로 분기된다 / AC-2: palm 접촉(width/height > 임계)은 무시된다 / AC-3: 스냅 계산이 화면 폭·방향별로 기대 좌표를 반환한다
- Tests: pnpm --filter @openedu/core test

### Step 6: react-primitives
- Goal: Button, IconButton, Input, Card, Stack/Cluster/Grid, Dialog, Tooltip을 `DESIGN.md` 계약대로 구현한다 (Radix 헤드리스, `ph ph-*` 아이콘, 포커스 링, 로딩 시 너비 유지)
- Files: packages/react/src/primitives/*.tsx, packages/react/src/primitives/*.css, packages/react/src/index.ts, packages/react/tests/primitives.test.tsx
- Acceptance: AC-1: Button variants(primary/secondary/ghost/danger)·sizes가 렌더되고 키보드 포커스 링이 보인다 / AC-2: Input은 label 없이 렌더되면 테스트가 실패한다 / AC-3: axe 접근성 검사 위반 0
- Tests: pnpm --filter @openedu/react test -- primitives
- Depends on: surface-profiles

### Step 7: content-schema
- Goal: QTI 부분집합 문항 스키마(choice, cloze, matching, ordering, hotspot, short-answer)와 지문(Passage)을 zod로 정의하고, 연구 문서의 JSON 예시가 검증을 통과한다
- Files: packages/content/src/schema.ts, packages/content/src/samples/*.json, packages/content/src/index.ts, packages/content/tests/schema.test.ts
- Acceptance: AC-1: 6개 문항 타입의 유효 샘플이 parse 통과, 필수 필드 누락 샘플은 사유와 함께 실패 / AC-2: `passageRef`가 존재하지 않는 지문을 가리키면 검증 실패
- Tests: pnpm --filter @openedu/content test

### Step 8: board-components
- Goal: 전자칠판 전용 컴포넌트 4종 — AdaptiveDock(좌/우 스냅·성인/어린이 높이), FocusCurtain(4방향 가림막, 스포트라이트 모드는 후속), RadialMenu(터치 지점 방사형), SplitBoard(2~4분할)
- Files: packages/react/src/board/*.tsx, packages/react/src/board/*.css, packages/react/src/board/index.ts, packages/react/tests/board.test.tsx
- Acceptance: AC-1: AdaptiveDock이 높이 프리셋 전환 시 하단 1/3 영역 안에 머문다 / AC-2: FocusCurtain이 드래그로 열림 비율을 바꾸고 키보드(방향키)로도 조작된다 / AC-3: SplitBoard 분할 수 2~4에서 영역별 독립 포인터 입력을 받는다 / AC-4: `data-surface="board"`에서 모든 터치 타겟 ≥ 64px
- Tests: pnpm --filter @openedu/react test -- board
- Depends on: core-input-layer, react-primitives

### Step 9: worksheet-components
- Goal: 문제지 컴포넌트 — TestPaperLayout(지문 고정 + 문항 스크롤), ItemRenderer(문항 타입별 분기), ExamNavigator(답안 팔레트·타이머), AnnotatableText(형광펜)
- Files: packages/react/src/worksheet/*.tsx, packages/react/src/worksheet/*.css, packages/react/src/worksheet/index.ts, packages/react/tests/worksheet.test.tsx
- Acceptance: AC-1: content-schema 샘플 6종이 각각 올바른 입력 UI로 렌더되고 선택 상태가 제어/비제어 모두 동작한다 / AC-2: ExamNavigator가 답안 현황·건너뛴 문항을 표시하고 클릭 시 해당 문항으로 이동한다 / AC-3: 모바일 폭(≤ 640px)에서 지문 영역이 문항 위로 접힌다
- Tests: pnpm --filter @openedu/react test -- worksheet
- Depends on: react-primitives, content-schema

### Step 10: virtual-manipulatives
- Goal: CPA 가상 교구 3종(수 모형 블록, 분수 막대, 바둑돌/수직선)과 수치 입력의 양방향 바인딩, 스냅 이동
- Files: packages/react/src/manipulatives/*.tsx, packages/react/src/manipulatives/*.css, packages/react/src/manipulatives/index.ts, packages/react/tests/manipulatives.test.tsx
- Acceptance: AC-1: 숫자 입력을 바꾸면 블록 개수가, 블록을 추가하면 숫자가 즉시 갱신된다 / AC-2: 드래그 종료 시 격자에 스냅된다 / AC-3: 키보드만으로 블록 추가/제거가 가능하다
- Tests: pnpm --filter @openedu/react test -- manipulatives
- Depends on: core-input-layer, react-primitives

### Step 11: print-worksheet
- Goal: 같은 문항 JSON을 A4 종이 학습지로 렌더한다(화면용 컴포넌트가 아니라 같은 스키마를 쓰는 인쇄 전용 정적 렌더러) (학생용/교사용 정답지 모드, 페이지 분할 시 문항이 쪼개지지 않음, 흑백 인쇄 시 대비 유지)
- Files: packages/print/src/print.css, packages/print/src/PrintWorksheet.tsx, packages/print/src/index.ts, packages/print/tests/print.test.tsx, scripts/ops/print-pdf.ts
- Acceptance: AC-1: `scripts/ops/print-pdf.ts`가 샘플 문항으로 A4 PDF를 생성하고 페이지 수가 기대값이다 / AC-2: 교사용 모드에서만 정답·해설이 PDF 텍스트에 나타난다 / AC-3: 문항 블록에 `break-inside: avoid`가 적용된다
- Tests: pnpm --filter @openedu/print test && pnpm print:sample
- Depends on: worksheet-components

### Step 12: showcase-and-visual
- Goal: Storybook/쇼케이스 앱이 board·desktop·mobile·print 표면별 데모 페이지를 제공하고, production 빌드를 localhost로 띄워 표면별 스크린샷을 캡처한다 (로고·app-icon·favicon 포함)
- Files: apps/showcase/**, public/logo.svg, public/app-icon.png, public/favicon.ico, scripts/ops/capture-showcase.ts
- Acceptance: AC-1: `pnpm --filter showcase build`가 성공하고 preview 서버가 200을 반환한다 / AC-2: 4개 표면 각각의 스크린샷이 `screenshots/` 폴더에 저장된다 / AC-3: favicon link 태그와 로고가 실제로 참조되고 404가 없다 / AC-4: 전송 압축(gzip/zstd)·장기 캐시·아이콘 preload 설정이 서빙 설정에 있다
- Tests: pnpm --filter showcase build && node scripts/ops/capture-showcase.ts
- Depends on: board-components, worksheet-components, virtual-manipulatives, print-worksheet

### Step 13: docs-and-release
- Goal: 사용 가이드(토큰·표면 프로파일·문항 스키마·인쇄), 컴포넌트 카탈로그, 패키지 배포 설정(changesets, ESM/CSS exports)을 문서화한다
- Files: README.md, docs/design-system/guide.md, docs/design-system/components.md, docs/adr/0029-design-system-architecture.md, .changeset/config.json
- Acceptance: AC-1: ADR이 설계 결정 1~7과 기각한 대안(Tailwind/shadcn, 웹 컴포넌트 우선)을 기록한다 / AC-2: `pnpm -r build && pnpm -r pack --dry-run`이 성공하고 exports가 ESM + CSS를 포함한다 / AC-3: README가 새 패키지 지도를 반영한다
- Tests: pnpm -r build && pnpm -r pack --dry-run
- Depends on: showcase-and-visual

## Verification
- **1단계 정적:** `pnpm -r typecheck`, ESLint, `pnpm lint:tokens`(토큰 밖 값 차단), 아이콘은 `ph ph-*`만 허용(다른 아이콘 세트/인라인 SVG grep 검사)
- **2단계 테스트:** vitest 단위·컴포넌트 테스트, axe 접근성, 스키마 계약 테스트, 프로파일 하한(타겟·폰트) 수치 테스트
- **3단계 실행/시각:** production 빌드 → localhost preview → 4개 표면 스크린샷, 인쇄 PDF 실제 생성. headless만 가능한 환경은 수동 시각 검토 대기로 남김
- 실제 전자칠판 하드웨어(멀티터치·펜) 검증은 이 로드맵의 범위 밖이며 **미검증**으로 명시한다 (에뮬레이션된 Pointer Events 테스트까지만)

## 결정 사항 (2026-10-01)
1. 패키지 스코프는 `@openedu/*`.
2. 1차 프레임워크는 React 19 고정.
3. 모바일 앱은 PWA 우선, 이후 Wails/Capacitor 래핑.
4. 연구 문서의 수치(본문 28pt+, 타겟 64px+)는 근거 문헌 확인 전까지 "잠정값"으로 표기한다.
