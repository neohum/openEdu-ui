# openEdu-ui

전자칠판 · 웹 · 앱 · 인터랙티브 콘텐츠 · 종이 학습지까지, 교육 자료를 위한 디자인 시스템입니다.

하나의 **디자인 토큰**과 하나의 **문항 스키마**를 기준으로, 표면(`board` / `desktop` / `mobile` / `print`)만 고르면 글자 크기·간격·터치 타겟이 자동으로 맞춰집니다.

> 🌐 **공식 문서 및 라이브 컴포넌트 뷰어:**
> openEdu-ui의 모든 컴포넌트(전자칠판, 가상 교구, 교육학적 색채, 무기명 행동 텔레메트리, Comwit UI 48종, 0.5pt 얇은 선 종이 학습지 등)를 브라우저에서 직접 조작하고 코드를 확인할 수 있습니다:
> 👉 **[https://edulinker.kr/docs/openedu-ui/overview](https://edulinker.kr/docs/openedu-ui/overview)**

> 상태: **v0.1.0** (첫 정식 릴리스). 디자인 토큰, 팜 리젝션 포인터 라우터, QTI 3.0 부분집합 6대 문항 스키마, perfect-freehand 독립 판서 엔진, 리액트 컴포넌트(전자칠판·문제지·가상 교구) 및 A4 인쇄 PDF 생성기까지 전 계층의 구현과 검증이 완료되었습니다. 구현 계획은 [ROADMAP.md](./ROADMAP.md), 디자인 규칙은 [DESIGN.md](./DESIGN.md)를 참고하세요.

## 목표

- 디자이너 없이도 일관되고 읽기 쉬운 화면 (4/8pt 스케일, 시맨틱 컬러 토큰)
- 전자칠판 환경: 큰 터치 타겟(56px+), 도달성을 고려한 어댑티브 도크, 가림막/스포트라이트, 분할 칠판
- 디지털 문제지: 지문 고정창 + 문항 스크롤, 답안 팔레트, 형광펜, QTI 3.0 부분집합 기반 문항 JSON
- 같은 문항 데이터를 화면과 A4 인쇄물(학생용/교사용)에서 모두 렌더링 및 PDF 생성
- 수학 가상 교구(수모형, 분수, 수직선 등 CPA 모델)와 벡터 판서 엔진(펜, 형광펜, 지우개)

## 기술 방향

React 19 + TypeScript + 순수 CSS, pnpm 워크스페이스(`@openedu/*`). 토큰은 CSS 변수로 빌드되어 프레임워크와 무관하게 쓸 수 있습니다.

## 패키지

| 패키지 | 내용 |
| --- | --- |
| `@openedu/tokens` | 디자인 토큰(DTCG) → CSS 변수, 4대 표면 프로파일(`board`, `desktop`, `mobile`, `print`), 8색 잉크 팔레트 |
| `@openedu/core` | 펜/터치/손바닥(팜 리젝션) 입력 라우터, 도달성 유틸, `InkLayer` 인터페이스 |
| `@openedu/content` | QTI 3.0 부분집합 6대 문항 스키마(Zod), 지문 및 문제지 데이터 모델 |
| `@openedu/ink` | perfect-freehand 기반 독립 판서 엔진(펜·형광펜·지우개, Undo/Redo, JSON/PNG 내보내기) |
| `@openedu/react` | 기본 UI·전자칠판(판서보드, 가림막, 분할보드, 어댑티브도크)·문제지(순서정렬, 지문고정, 형광펜)·가상교구(수모형, 분수, 수직선) 컴포넌트 |
| `@openedu/print` | A4 인쇄 학습지(학생용/교사용) 렌더러 및 Headless Chromium 기반 PDF 생성기 |

문서: [공식 온라인 문서 포털](https://edulinker.kr/docs/openedu-ui/overview) · [사용 가이드](docs/design-system/guide.md) · [컴포넌트 카탈로그](docs/design-system/components.md) · [설계 결정(ADR)](docs/adr/0029-design-system-architecture.md) · [로드맵](ROADMAP.md)

v0.1.0 릴리스 준비가 완료되었으며, `pnpm pack:check`로 배포 tarball을 확인할 수 있습니다.

## 공식 문서 및 대화형 컴포넌트 뷰어

openEdu-ui의 전체 컴포넌트 스펙, 실시간 조작 샌드박스, 교육학적 이론 배경 및 복사 가능한 코드는 공식 개발지원센터에서 직접 확인하고 조작할 수 있습니다:

🔗 **[https://edulinker.kr/docs/openedu-ui/overview](https://edulinker.kr/docs/openedu-ui/overview)**

- **교육학적 색채 시스템 (EducationalColors):** 인지부하 이론, 감정 필터, ZPD 비계, 얼렌 증후군 시각 피로 완화 기반 7대 인지 토큰
- **학생 행동 관찰 & 무기명 텔레메트리 (EducationalTelemetry):** Zero-PII 무기명 세션 토큰, 체류 시간(dwell), 망설임 지연(hesitation), 재시도 루프, 실시간 관찰 히트맵
- **Comwit UI 컴포넌트 슈트 (ComwitUISuite):** Basics, Glass, Notifications, Selection, Pickers, Forms & Data, Mobile App, Chat 8대 그룹 48종 전체 컴포넌트
- **종이 학습지 0.5pt 얇은 선 블랙 UI (ThinBlackPaper):** 0.5pt/0.75pt 초극세사 헤어라인 흑백 시험지, OMR 버블, 줄노트, 좌표평면, 교사 루브릭 채점표
- **전자칠판 & 가상 교구:** InkBoard(벡터 판서), FocusCurtain(가림막/스포트라이트), SplitBoard(분할 칠판), BaseTenBlocks(수모형), FractionStrips(분수띠), NumberLine(수직선)

## 쇼케이스

```bash
pnpm install
pnpm --filter showcase dev        # 개발 서버
pnpm capture                      # production 빌드 → 실제 Chrome으로 4개 표면 캡처·검사 (screenshots/)
pnpm print:sample                 # 샘플 학습지를 A4 PDF로 생성 (out/print/)
```

| 표면 | 화면 |
| --- | --- |
| board | ![board](screenshots/board.png) |
| desktop | ![desktop](screenshots/desktop.png) |
| mobile | ![mobile](screenshots/mobile.png) |

## 아이콘

컴포넌트는 [Phosphor Icons](https://phosphoricons.com)(MIT) Regular 글꼴의 `ph ph-*` 클래스를 사용합니다. 사용하는 쪽에서 `@phosphor-icons/web`을 설치하고 `@phosphor-icons/web/regular` CSS를 불러오면 됩니다. 출처 표기 의무가 없는 MIT 라이선스입니다.

## 라이선스

[MIT](./LICENSE)
