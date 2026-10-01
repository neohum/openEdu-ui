# 컴포넌트 카탈로그

모든 컴포넌트는 `@openedu/react`에서 import합니다. 터치 타겟은 `--target-min` 이상이고, 아이콘은 Phosphor Icons(`ph ph-*`)입니다.

## 기본

| 컴포넌트 | 설명 |
| --- | --- |
| `Button` | `variant` primary/secondary/ghost/danger, `size` sm/md, `loading`(너비 유지) |
| `IconButton` | `icon`(Phosphor 이름, 예: `x`, `trash`)과 `label`(접근 가능한 이름) 필수 |
| `Input` | `label` 필수(없으면 오류), `hint`, `error`가 `aria-describedby`로 연결 |
| `Card`, `Stack`, `Cluster`, `Grid` | 표면 위 그룹과 간격 토큰 기반 레이아웃 |
| `Dialog`, `Tooltip` | Radix 기반 접근성 동작 |

## 전자칠판

| 컴포넌트 | 설명 |
| --- | --- |
| `AdaptiveDock` | 하단 1/3 안에 머무는 도구 막대. 좌/우 스냅(드래그·방향키), 교사/학생 높이 |
| `FocusCurtain` | 4방향 가림막. 드래그, 방향키, Home/End |
| `RadialMenu` | 터치 지점 주변 방사형 메뉴, 화면 밖으로 나가지 않음 |
| `SplitBoard` | 2~4개 독립 영역, 영역별 포인터 라우팅과 푸터 |
| `InkToolbar` | 판서 도구 막대(펜·형광펜·지우개, 6색 팔레트, 굵기, undo/redo, 2단계 clear) |
| `InkCanvas` | `@openedu/ink` 엔진과 포인터 라우터를 연결하는 캔버스 호스트 영역 |
| `InkBoard` | `InkCanvas`와 `InkToolbar`가 결합된 올인원 전자칠판 판서 보드 컴포넌트 |

## 문제지

| 컴포넌트 | 설명 |
| --- | --- |
| `TestPaperLayout` | 넓은 화면은 지문+답안 팔레트 사이드 컬럼, 좁은 화면은 쌓이고 지문이 접힘 |
| `ItemRenderer` | 문항 타입별 입력 UI(제어/비제어, `readOnly`) |
| `ExamNavigator` | 답 완료/건너뜀/미응답, 타이머, 클릭 시 해당 문항으로 스크롤 |
| `AnnotatableText` | 선택해서 형광펜, 탭하면 해제 |

## 가상 교구

| 컴포넌트 | 설명 |
| --- | --- |
| `BaseTenBlocks` | 숫자 ⇄ 백·십·일 블록 양방향 |
| `FractionBar` | n/d 막대 |
| `NumberLine` | 드래그하면 따라가고 놓으면 격자에 스냅, 키보드 조작 |

## 인쇄 (`@openedu/print`)

`PrintWorksheet`(student/teacher). `@openedu/print/print.css`를 함께 로드합니다.

## 알려진 한계

- matching은 `select`, ordering은 위/아래 버튼입니다(드래그 방식은 후속).
- 스포트라이트 모드와 핫스팟 인쇄 이미지는 아직 없습니다.
- 실제 전자칠판 하드웨어 검증은 하지 않았습니다.
