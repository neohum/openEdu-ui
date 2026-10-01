# 사용 가이드

## 스타일 로드 순서

```tsx
import "@openedu/tokens/tokens.css";
import "@openedu/tokens/surfaces.css";
import "@flaticon/flaticon-uicons/css/regular/rounded.css"; // 아이콘: 직접 설치, Flaticon 라이선스 적용
import "@openedu/react/styles.css";
```

토큰이 먼저 로드되어야 `@layer tokens, components` 순서가 맞습니다.

## 토큰

색은 역할 이름으로만 씁니다: `var(--color-bg | surface | surface-sunken | fg | fg-muted | border | accent | danger | success)`. 간격은 `var(--space-1..12)`(= `--space-unit` × n), 글자는 `var(--font-size-xs … 4xl)`.
토큰 밖 값(`13px`, 임의 hex)은 `pnpm lint:tokens`가 막습니다. 예외가 꼭 필요하면 그 줄에 `lint-ignore` 주석을 남깁니다.

## 표면 프로파일

`<html data-surface="board|desktop|mobile|print">`

| 표면 | 간격 단위 | 본문 | 터치 타겟 |
| --- | --- | --- | --- |
| desktop | 4px | 16px | 44px |
| mobile | 4px | 16px | 48px |
| board | 8px | ≈28.8pt (잠정) | 64px, 권장 80px (잠정) |
| print | 4px | ≈10.8pt | — (밝은 고대비 색, 그림자 없음) |

다크 테마는 `prefers-color-scheme`을 따르고 `data-theme="light|dark"`로 강제할 수 있습니다.

## 문항 스키마

```ts
import { paper } from "@openedu/content";
const data = paper.parse(json); // 정답↔선택지 id, 빈칸, passageRef 등을 교차 검증
```

문항 타입: `choice`, `cloze`(`{{id}}` 빈칸), `matching`, `ordering`, `hotspot`, `short-answer`. 샘플은 `packages/content/src/samples/`.

## 화면과 종이에서 같은 문항 쓰기

```tsx
// 화면
<ItemRenderer item={item} number={1} value={answers[item.id]} onChange={...} />
// 종이
<PrintWorksheet paper={data} mode="student" />   // 또는 "teacher"
```

`pnpm print:sample`이 샘플 학습지를 학생용/교사용 A4 PDF로 만듭니다(Chrome 필요, `CHROME_PATH`로 지정 가능).

## 판서 엔진 연결

`@openedu/core`의 `createPointerRouter`가 펜은 `ink`, 손가락은 `ui`로 나누고 손바닥 접촉과 펜 사용 중 터치를 무시합니다. 판서 엔진은 `InkLayer` 인터페이스를 구현해 연결합니다.

## 검증

| 명령 | 내용 |
| --- | --- |
| `pnpm typecheck` / `pnpm lint` / `pnpm -r test` | 정적 검사, 테스트 |
| `pnpm lint:tokens` | 토큰 밖 값 검사 |
| `pnpm capture` | production 빌드를 실제 Chrome으로 열어 4개 표면 스크린샷과 검사 |
| `pnpm pack:check` | 배포 tarball 내용 확인 (`out/pack`) |
