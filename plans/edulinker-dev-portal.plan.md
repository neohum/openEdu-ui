---
plan: edulinker-dev-portal
status: approved
risk: medium
owner: neohum
---
# Plan: edulinker.kr 개발지원센터 및 생태계 문서 포털 구축

## Intent
`edulinker.kr` 메인 상단 헤더에 `개발지원센터` 메뉴를 신설하고, 에코시스템 전체의 API·SDK·라이브러리를 버전별로 열람할 수 있는 깃북(GitBook) 스타일의 문서 포털을 구축한다. 특히 `openEdu-ui`의 핵심 컴포넌트(판서 보드, 스포트라이트 가림막, 선 잇기 매칭, 순서 드래그, 가상 교구)를 문서 페이지 안에서 직접 클릭·조작·테스트할 수 있는 대화형 라이브 플레이그라운드를 제공한다.

## File Layout Sketch
- `D:/works/web_service-relay/src/app/(public)/page.tsx`: 상단 헤더에 `개발지원센터` 내비게이션 링크 추가
- `D:/works/web_service-relay/src/app/(public)/docs/layout.tsx`: 깃북 스타일 2단/3단 반응형 문서 레이아웃 (사이드바 + 본문 + 목차)
- `D:/works/web_service-relay/src/app/(public)/docs/page.tsx`: 개발지원센터 홈 대시보드 (에코시스템 라이브러리/SDK 카드 및 빠른 시작)
- `D:/works/web_service-relay/src/app/(public)/docs/[ecosystem]/[[...slug]]/page.tsx`: 버전 선택 및 동적 문서 뷰어
- `D:/works/web_service-relay/src/components/docs/DocsSidebar.tsx`: 생태계/카테고리 트리 및 버전 선택 드롭다운 사이드바
- `D:/works/web_service-relay/src/components/docs/DocsHeader.tsx`: 문서 검색, 생태계 전환 탭, 버전 배지
- `D:/works/web_service-relay/src/components/docs/CodeBlock.tsx`: 구문 강조 및 원클릭 복사 코드 블록
- `D:/works/web_service-relay/src/components/docs/ComponentPlayground.tsx`: `openEdu-ui` 컴포넌트 실시간 렌더링 및 조작 샌드박스
- `D:/works/web_service-relay/src/lib/docs/manifest.ts`: 각 SDK/API별 버전 및 목차 매니페스트 (openEdu-ui v0.1.0/v0.0.0, 런처 SDK, 릴레이 API)
- `D:/works/web_service-relay/src/lib/docs/content.ts`: 마크다운 및 인터랙티브 위젯 연동 콘텐츠 로더

## Non-goals
- 외부 서드파티 문서 SaaS(GitBook 유료 플랜 등) 연동 (EduLinker 자체 호스팅으로 완결)
- 실시간 멀티플레이어 협업 편집기 (정적 릴리스 문서 뷰어에 집중)
- 로그인 필수 접근 제어 (개발지원센터는 공개 생태계 접근성 보장)

## Steps

### Step 1: edulinker-nav-and-portal-shell
- Goal: `edulinker.kr` 메인 상단 헤더에 `개발지원센터` 링크를 배치하고, 깃북 형태의 문서 포털 쉘(사이드바, 헤더, 반응형 드로어 레이아웃)을 생성한다.
- Files: web_service-relay/src/app/(public)/page.tsx, web_service-relay/src/app/(public)/docs/layout.tsx, web_service-relay/src/components/docs/DocsSidebar.tsx, web_service-relay/src/components/docs/DocsHeader.tsx
- Acceptance: AC-1: 메인 랜딩 페이지 상단 헤더에 `개발지원센터` 메뉴가 렌더링되고 `/docs`로 이동한다 | AC-2: `/docs` 접근 시 좌측 트리 내비게이션, 상단 헤더, 모바일 반응형 토글 메뉴가 올바르게 렌더링된다 | AC-3: Flaticon UIcons 단일 표준 및 사이드바 좌측 정렬 규칙을 준수한다
- Tests: pnpm --filter web-service test -- docs-shell
- Risk: low
- Complexity: low

### Step 2: doc-versioning-and-renderer
- Goal: 각 SDK/API별 버전(v0.1.0, v0.0.0 등)을 선택할 수 있는 버저닝 시스템과 코드 블록 복사, 목차(TOC), 콜아웃을 갖춘 마크다운 렌더러를 구현한다.
- Files: web_service-relay/src/lib/docs/manifest.ts, web_service-relay/src/components/docs/CodeBlock.tsx, web_service-relay/src/app/(public)/docs/[ecosystem]/[[...slug]]/page.tsx
- Acceptance: AC-1: 버전 선택 드롭다운에서 버전을 변경하면 해당 버전의 문서 경로(`/docs/openedu-ui/v0.1.0/...`)로 전환된다 | AC-2: 코드 블록 상단에 언어 라벨과 복사 버튼이 동작하고 클립보드에 복사된다 | AC-3: 본문 헤딩에 기반한 우측 On this page 목차 클릭 시 해당 섹션으로 스크롤된다
- Tests: pnpm --filter web-service test -- docs-versioning
- Risk: medium
- Complexity: medium

### Step 3: openedu-ui-live-playground
- Goal: 문서 본문 내에서 `openEdu-ui`의 실제 리액트 컴포넌트(InkBoard, FocusCurtain, MatchingItem, OrderingItem, BaseTenBlocks 등)를 브라우저에서 직접 조작하고 테스트할 수 있는 대화형 플레이그라운드 위젯을 통합한다.
- Files: web_service-relay/src/components/docs/ComponentPlayground.tsx, web_service-relay/package.json, web_service-relay/src/app/(public)/docs/components-preview.css
- Acceptance: AC-1: 문서 페이지 안에서 `InkBoard`에 직접 마우스/터치 필기 및 PNG 다운로드가 동작한다 | AC-2: `FocusCurtain` 스포트라이트 모드를 드래그/방향키로 이동 테스트할 수 있다 | AC-3: `MatchingItem` 선 잇기 및 `OrderingItem` 드래그 정렬이 실시간으로 상호작용한다
- Tests: pnpm --filter web-service test -- docs-playground
- Risk: medium
- Complexity: medium

### Step 4: dev-portal-content-and-verification
- Goal: openEdu-ui v0.1.0 전체 가이드/컴포넌트 명세와 EduLinker 생태계(런처 연동, 릴레이 API) 문서를 탑재하고 실 브라우저 렌더링 및 빌드를 검증한다.
- Files: web_service-relay/src/lib/docs/content.ts, web_service-relay/src/app/(public)/docs/page.tsx
- Acceptance: AC-1: `pnpm --filter web-service build`가 오류 없이 성공한다 | AC-2: 개발지원센터 홈 대시보드에서 openEdu-ui, 구름학교 런처, 릴레이 API 카드가 렌더링된다 | AC-3: axe 접근성 검사 위반 0건 유지
- Tests: pnpm --filter web-service build && pnpm --filter web-service test
- Risk: low
- Complexity: low

## Verification
- **Tier 1 정적 검사:** `pnpm lint`, `pnpm typecheck`, `pnpm lint:tokens`
- **Tier 2 테스트:** vitest 단위 검증 (문서 라우팅, 버전 전환, 컴포넌트 플레이그라운드 렌더링, axe 접근성 검사)
- **Tier 3 실행/시각 검증:** `next build` 후 프로덕션 실행 및 실 브라우저에서 `/docs` 상단 메뉴, 깃북 3단 레이아웃, 라이브 판서/교구 조작 확인

## Reviewer topology
- builder=Codex/AGY, reviewer=Claude (독립 리뷰 및 페르소나 검증)
