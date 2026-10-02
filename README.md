# openEdu-ui

전자칠판 · 웹 · 앱 · 인터랙티브 콘텐츠 · 종이 학습지까지, 교육 자료를 위한 디자인 시스템입니다.

하나의 **디자인 토큰**과 하나의 **문항 스키마**를 기준으로, 표면(`board` / `desktop` / `mobile` / `print`)만 고르면 글자 크기·간격·터치 타겟이 자동으로 맞춰집니다.

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

문서: [사용 가이드](docs/design-system/guide.md) · [컴포넌트 카탈로그](docs/design-system/components.md) · [설계 결정(ADR)](docs/adr/0029-design-system-architecture.md) · [로드맵](ROADMAP.md)

v0.1.0 릴리스 준비가 완료되었으며, `pnpm pack:check`로 배포 tarball을 확인할 수 있습니다.

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
