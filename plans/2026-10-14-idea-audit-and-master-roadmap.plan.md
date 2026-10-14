---
slug: 2026-10-14-idea-audit-and-master-roadmap
title: "openEdu-ui 전수 아이디어·플랜 감사 및 마스터 개발 로드맵"
status: done
risk: medium
created: 2026-10-14
---

# Plan: openEdu-ui 전수 아이디어·플랜 감사 및 마스터 개발 로드맵

## 1. 감사 개요 (Audit Summary)

교육 전용 디자인 시스템 및 React 컴포넌트 모노레포(`openEdu-ui`)의 보유 플랜 2종과 실제 워크스페이스 패키지(`packages/tokens`, `packages/core`, `packages/ink`, `packages/content`, `packages/print`, `packages/react`, `apps/showcase`)를 전수 대조하였다.
1. `edu-ui-complete-system.plan.md`의 7대 계층 중 프리미티브(`primitives/`), 5대 테마(`theme/`), 수업 도구 5종(`tools/`), 종이학습지 평면 컴포넌트(`worksheet/`), 수식·교육 아이콘(`icons/`)은 높은 완성도로 구현 및 단위 테스트(`packages/react/tests/`)가 완료되었다. 그러나 **계층 2 전자칠판 전용 컴포넌트 중 `board-header.tsx` 및 `board-canvas.tsx`가 누락**되어 있고, **계층 5의 `MathEquationItem` 및 `TwoColumnExamLayout`이 전용 모듈로 분리되지 않았으며**, **Step 5의 라이브 플레이그라운드 뷰어 4종이 외부 리포지토리(`web_service`)에만 계획되어 정작 `openEdu-ui` 자체 쇼케이스 앱(`apps/showcase`)에는 통합 플레이그라운드가 빠져 있는 상태**다.
2. `edulinker-dev-portal.plan.md` 역시 외부 `web_service-relay` 리포지토리 경로를 대상으로 작성되어 있어, `openEdu-ui` 자체에서 독립 실행 가능한 문서·플레이그라운드 허브 내재화가 필요하다.

---

## 2. 보유 플랜 실현 상태 판정 표

| 플랜 파일명 (`plans/*.plan.md`) | 실현 여부 | 코드 및 테스트 근거 | 추가 개발 가치 및 우선순위 |
| --- | --- | --- | --- |
| `edu-ui-complete-system.plan.md` (완전한 에듀테크 컴포넌트 생태계 및 실시간 테마·수식 아이콘 시스템) | **부분 구현** | `packages/react/src/{primitives,theme,tools,worksheet,icons}` 및 `tests/{primitives-theme,classroom-tools,paper-worksheet,math-icons}.test.tsx` 구현 완료. **단, `packages/react/src/board/board-header.tsx`, `board-canvas.tsx` 미구현, `worksheet` 내 `MathEquationItem`·`TwoColumnExamLayout` 미분리, 자체 `apps/showcase` 내 플레이그라운드 뷰어 미통합** | **최우선 (P0)** — 누락된 전자칠판 배경 캔버스(`BoardCanvas`: 오선지/영어4선지/원고지/모눈)와 교시 헤더(`BoardHeader`), 수식 문항 컴포넌트를 완성해야 함 |
| `edulinker-dev-portal.plan.md` (edulinker.kr 개발지원센터 및 생태계 문서 포털 구축) | **부분 구현** | 타 저장소(`D:/works/web_service-relay`) 대상 계획서로 작성됨. `openEdu-ui` 내부에는 `apps/showcase/src/App.tsx`만 존재하고 버전별 문서·컴포넌트 인터랙티브 플레이그라운드(`ThemeCustomizerWidget`, `ClassroomToolsViewer`, `PaperWorksheetViewer`, `MathSymbolToolbarViewer`)가 자체 앱에 탑재되지 않음 | **높음 (P1)** — `apps/showcase`를 자체 완결형 개발지원센터 & 라이브 플레이그라운드로 격상하여 외부 릴레이 서버 없이도 즉시 프리뷰·검증 가능하게 구축 |

---

## 3. 미구현·개선 사항 단계별 개발 계획서 (Master Roadmap)

### Step 1: board-header-and-multi-grid-canvas
- Goal: `edu-ui-complete-system.plan.md` 계층 2에서 누락된 `BoardHeader`(교시 인디케이터, 과목·단원명, 학습목표, 시계 결합 헤더)와 `BoardCanvas`(래디얼 도트, 5mm 모눈, 음악 5선지, 영어 4선지, 원고지 배경 전환 및 `InkBoard` 결합 칠판)를 구현한다.
- Files: packages/react/src/board/board-header.tsx, packages/react/src/board/board-header.css, packages/react/src/board/board-canvas.tsx, packages/react/src/board/board-canvas.css, packages/react/src/board/index.ts, packages/react/tests/board.test.tsx
- Acceptance:
  - AC-1: `BoardHeader`가 1~6교시 칩, 과목명, 단원명, 학습문제 및 실시간 시계를 표시하고 교시 전환 콜백을 지원한다.
  - AC-2: `BoardCanvas`가 `plain`, `dots`, `grid-5mm`, `music-staff`(오선지), `english-4line`(영어 4선지), `manuscript`(원고지) 6종 배경 프리셋을 SVG 패턴으로 선명하게 렌더링한다.
  - AC-3: `packages/react/tests/board.test.tsx`에서 신규 컴포넌트의 렌더링 및 axe 접근성 검사(위반 0건)가 통과한다.
- Tests: pnpm --filter @openedu/react test -- board
- Risk: low
- Complexity: medium

### Step 2: math-equation-and-two-column-exam-items
- Goal: 계층 5 평가·문제지 컴포넌트 중 `MathEquationItem`(세로 분수·근호·위아래 첨자 구조화 수식 렌더러 및 답안 입력 문항)과 `TwoColumnExamLayout`(좌단 지문 / 우단 문항 2단 분할 시험지 레이아웃)을 구현하고 `@openedu/content` 스키마와 연동한다.
- Files: packages/react/src/worksheet/math-equation-item.tsx, packages/react/src/worksheet/two-column-exam-layout.tsx, packages/react/src/worksheet/index.ts, packages/content/src/schema.ts, packages/react/tests/worksheet.test.tsx
- Acceptance:
  - AC-1: `MathEquationItem`이 외부 무거운 LaTeX 런타임 없이도 분수(`frac`), 근호(`sqrt`), 첨자(`sup`/`sub`) 토큰 표현식을 시맨틱 수식 DOM 및 `MathSymbolToolbar` 입력과 양방향 연동한다.
  - AC-2: `TwoColumnExamLayout`이 화면 및 `@openedu/print` A4 인쇄 시 좌측 지문 고정·우측 다문항 배치 및 중앙 구분선을 정밀하게 유지한다.
  - AC-3: 단위 테스트 및 인쇄 레이아웃 테스트가 100% 통과한다.
- Tests: pnpm --filter @openedu/react test -- worksheet && pnpm --filter @openedu/content test
- Depends on: board-header-and-multi-grid-canvas
- Risk: low
- Complexity: medium

### Step 3: showcase-interactive-playground-portal
- Goal: `apps/showcase`에 `ThemeCustomizerWidget`, `ClassroomToolsViewer`, `PaperWorksheetViewer`, `MathSymbolToolbarViewer`, `ElectronicBoardViewer`를 탑재하여 모든 `@openedu/react` 컴포넌트를 실시간 테마 전환과 함께 조작·검증할 수 있는 통합 포털을 완성한다.
- Files: apps/showcase/src/App.tsx, apps/showcase/src/showcase.css, apps/showcase/src/views/ThemeCustomizerWidget.tsx, apps/showcase/src/views/ClassroomToolsViewer.tsx, apps/showcase/src/views/PaperWorksheetViewer.tsx, apps/showcase/src/views/MathSymbolToolbarViewer.tsx, apps/showcase/src/views/ElectronicBoardViewer.tsx
- Acceptance:
  - AC-1: `apps/showcase` 상단/측면에서 5대 내장 테마(`chalkboard`, `paper`, `violet`, `emerald`, `amber`) 및 커스텀 Hex 컬러를 변경하면 모든 플레이그라운드 뷰어에 즉시 반영된다.
  - AC-2: 전자칠판(배경 전환 + 판서), 수업 도구 5종, 종이학습지 및 A4 인쇄 미리보기, 수식 입력 툴바를 탭으로 전환하며 라이브 조작 및 코드 스니펫 복사가 가능하다.
  - AC-3: `pnpm --filter @openedu/showcase build` 및 전체 모노레포 빌드가 에러 없이 통과한다.
- Tests: pnpm build && pnpm test
- Depends on: math-equation-and-two-column-exam-items
- Risk: medium
- Complexity: medium

## 4. Verification
- **Tier 1 (정적 및 토큰 검사)**: `pnpm lint && pnpm typecheck && pnpm lint:tokens`
- **Tier 2 (단위 및 접근성 테스트)**: `pnpm test` (Vitest + vitest-axe 접근성 위반 0건)
- **Tier 3 (빌드 및 런타임 검증)**: `pnpm build` 후 `apps/showcase` 프리뷰 서버에서 5대 테마 전환, 전자칠판 6종 배경, 학습지 인쇄 미리보기 확인
