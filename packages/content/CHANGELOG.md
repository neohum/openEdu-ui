# @openedu/content

## 0.1.0

### Minor Changes

- # openEdu-ui v0.1.0 릴리스
  
  교육 환경(전자칠판, 데스크톱, 모바일, 인쇄 학습지)을 위한 통합 디자인 시스템 **openEdu-ui**의 첫 번째 공식 마이너 릴리스(`v0.1.0`)입니다.
  
  단일 디자인 토큰과 QTI 3.0 부분집합 문항 스키마를 기반으로, 4대 표면 프로파일 지원부터 팜 리젝션 포인터 라우터, 판서 엔진, 전자칠판·문제지·가상 교구 컴포넌트, A4 인쇄 생성기까지 전 계층이 구현되었습니다.
  
  ## 주요 기능 및 구성
  
  ### 1. 4대 표면 프로파일 및 디자인 토큰 (`@openedu/tokens`)
  - **4대 표면 프로파일 (`board`, `desktop`, `mobile`, `print`)**:
    - `data-surface` 속성 지정만으로 폰트 크기, 간격(4/8pt 스케일), 터치 타겟(전자칠판 56px+, 모바일 44px+), 라운딩 등이 자동 전환.
  - **DTCG(Design Tokens Community Group) 표준 기반 토큰**:
    - 시맨틱 컬러 토큰(primary, neutral, surface, text, border, feedback).
    - 8종 교실 특화 잉크 컬러 팔레트(white, yellow, cyan, pink, orange, green, red, black).
    - 고대비(High-contrast) 모드 및 라이트/다크 테마 완벽 지원.
    - 순수 CSS 변수 빌드(`dist/tokens.css`, `dist/surfaces.css`) 및 원본 JSON(`tokens.json`, `surfaces.json`) 동시 제공.
  
  ### 2. 펜/터치/팜 리젝션 포인터 라우터 (`@openedu/core`)
  - **포인터 라우터 (`PointerRouter`)**:
    - 펜(Stylus), 터치(Finger), 마우스 입력을 정밀 감지 및 분기 처리.
    - 필기 시 손바닥 접촉 및 비정상 터치 타원을 걸러내는 팜 리젝션(Palm Rejection) 알고리즘 내장.
  - **도달성(Reachability) 유틸리티**:
    - 전자칠판 높이에 따른 교사 및 학생의 신체적 도달 범위(`getReachableBounds`) 계산.
    - 사이드/하단/플로팅 도크 위치 동적 산출.
  - **`InkLayer` 인터페이스**:
    - 판서 및 오버레이 잉크 레이어와의 연동을 위한 표준 추상화 규격 제공.
  
  ### 3. QTI 3.0 부분집합 6대 문항 스키마 (`@openedu/content`)
  - **Zod 기반의 타입 세이프 문항 스키마**:
    1. `choice`: 단일 및 다중 선택형 객관식 문항
    2. `cloze`: 빈칸 채우기 / 완성형 문항 (`{{id}}` 템플릿 구문)
    3. `matching`: 좌-우 상응 요소 연결형 문항
    4. `ordering`: 드래그 순서 정렬형 문항
    5. `hotspot`: 이미지 내 직사각형/원형 영역 선택형 문항
    6. `short-answer`: 단답형 / 주관식 빈칸 문항 (대소문자 옵션 지원)
  - **지문(`Passage`) 및 문제지 세트(`Paper`) 스키마**:
    - 공통 지문 연결(`passageRef`), 배점(`points`), 상세 해설(`explanation`) 지원.
    - 검증된 교육용 샘플 데이터셋(`paper.json`) 내장.
  
  ### 4. perfect-freehand 기반 독립 판서 엔진 (`@openedu/ink`)
  - **벡터 판서 엔진 (`createInkEngine`)**:
    - `perfect-freehand` 알고리즘 기반 압력 감응형 미려한 스트로크 패스 생성.
    - 펜(Pen), 형광펜(Highlighter, 반투명 블렌딩), 지우개(Eraser, 스트로크/픽셀 단위 소거) 도구 완비.
    - 실행 취소/다시 실행(Undo/Redo) 히스토리 스택 관리.
    - 벡터 스트로크 JSON 직렬화/역직렬화(`exportJson`, `loadJson`) 및 PNG 래스터 이미지 내보내기(`exportPng`).
  - **입력 바인딩 (`attachInkInput`) 및 유효성 검증 (`parseInkState`)**:
    - DOM 포인터 이벤트와 코어 팜 리젝션을 결합한 부드러운 필기 경험 제공.
  
  ### 5. 전자칠판·문제지·가상교구 리액트 컴포넌트 (`@openedu/react`)
  - **기본 UI 프리미티브**:
    - `Button`, `Input`, `Card`, `Dialog`, `Tooltip`, `SurfaceProvider`, `Icon` (Phosphor Icons 기반 단일 표준).
  - **전자칠판 컴포넌트 (`board/`)**:
    - `Board`, `BoardSurface`: 칠판 배경 및 판서 레이어 결합 뷰.
    - `SpotlightCover`, `Curtain`: 수업 집중을 돕는 스포트라이트 및 상하/좌우 가림막.
    - `SplitBoard`: 2~3분할 독립 필기 및 비교 수업용 분할 칠판.
    - `AdaptiveDock`: 교사/학생 눈높이에 맞춰 상하좌우 및 플로팅으로 전환되는 어댑티브 도크.
  - **문제지 컴포넌트 (`worksheet/`)**:
    - `WorksheetViewer`: 디지털 문제지 전체 레이아웃 뷰어.
    - `PassagePane`: 문제 스크롤 시에도 지문을 항상 유지하는 고정 분할 지문창.
    - `AnswerPalette`: 문제 이동 네비게이션 및 답안 마킹 현황 팔레트.
    - 6대 문항 뷰어: `ChoiceItemView`, `ClozeItemView`, `MatchingItemView`, `OrderingItemView`(드래그 순서정렬), `HotspotItemView`, `ShortAnswerItemView`.
    - `Highlighter`: 지문 및 문제 텍스트 강조용 형광펜 인터랙션.
  - **가상 교구 컴포넌트 (CPA 모델, `manipulatives/`)**:
    - `BaseTenBlocks`: 십진법 수모형 (단위, 십, 백, 천 모형 시각화 및 인터랙티브 조작).
    - `FractionBars` / `FractionCircles`: 막대 및 원형 분수 교구 (등분할 및 분수 연산 시각화).
    - `NumberLine`: 범위와 눈금을 유연하게 설정할 수 있는 인터랙티브 수직선.
  - **판서 리액트 통합 (`ink/`)**:
    - `InkBoard`, `InkToolbar`: 칠판 판서 UI, 색상 팔레트, 굵기 선택, 지우개/형광펜 컨트롤 완비.
  
  ### 6. A4 인쇄 학습지 및 PDF 생성기 (`@openedu/print`)
  - **A4 인쇄 학습지 컴포넌트 (`PrintWorksheet`)**:
    - 동일한 QTI 3.0 `Paper` 데이터를 화면뿐 아니라 표준 종이 학습지 레이아웃으로 렌더링.
    - 학생용(`student`): 문제 풀이 공백, O/X 및 답안 표기란 제공.
    - 교사용(`teacher`): 정답 강조 표시, 빈칸 정답 인라인 삽입, 상세 해설 및 배점 자동 노출.
  - **A4 전용 인쇄 스타일시트 (`print.css`)**:
    - `@media print` 및 `data-surface="print"` 대응 페이지 나눔 제어(`break-inside: avoid`), 폰트 및 테두리 최적화.
  - **헤드리스 PDF 생성 도구 (`scripts/ops/print-pdf.ts`)**:
    - Headless Chromium을 활용하여 A4 학생용/교사용 PDF 자동 생성 및 `pdfjs-dist` 기반 검증 완료.
