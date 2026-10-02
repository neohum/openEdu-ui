# Working language, encoding, and platform build notes

> Loaded on demand. This carries the authority of [`AGENTS.md`](../AGENTS.md) and
> [`CLAUDE.md`](../CLAUDE.md), which state each rule in one line and link here for
> the reasoning. The reasoning is the part worth keeping — every one of these was
> written after the failure it prevents.

## Working language & encoding

- **Korean first.** User-facing text — UI copy, docs, card summaries, commit
  message bodies, Telegram notifications — defaults to Korean unless the spec
  says otherwise. Code identifiers and log/error keys stay in English.
- **UTF-8 everywhere, no BOM — except `.ps1`, which requires one.** Every file
  is written UTF-8 without BOM (`.editorconfig` enforces it). Web pages declare
  `<meta charset="utf-8">` and default to `<html lang="ko">`. The exception is
  narrow and mandatory: see *No mojibake on Windows* below.
- **No mojibake on Windows.** PowerShell scripts set the console to UTF-8
  before printing (see `scripts/loop/health.ps1`); never read agent/tool output
  through a legacy codepage (CP949). If Korean text renders as `?` or `占쏙옙`,
  fix the encoding at the source — do not strip the Korean.
  That console setting fixes *output*; it cannot fix how the file itself was
  read. Windows PowerShell 5.1 — what `powershell` resolves to, and what the
  loop invokes — decodes a BOM-less `.ps1` as the ANSI codepage, so any
  non-ASCII byte is misread before the first line runs. It is worse than
  mojibake: `✓` and `—` end in bytes `0x93`/`0x94`, which CP1252 maps to the
  curly quotes `“`/`”`, and PowerShell's tokenizer accepts those as string
  delimiters — the script fails to *parse*. So **every `.ps1` ships with a
  UTF-8 BOM**, and that is the only place a BOM is allowed.
- **Local time in anything human-facing.** Timestamps shown to people — docs,
  card summaries, Telegram notifications, dashboards — use the host's local
  timezone: **Asia/Seoul by default**, and the deployment region's timezone if
  the host moves. Machine-facing records (logs, SQLite rows, traces) stay
  ISO 8601 **with an explicit offset** — never bare UTC presented as local
  time, never a naive timestamp.

> 짧은 형태의 senior-engineer 기본기(읽고 나서 쓰기, 투기적 스코프 금지, 조용한
> 실패 금지 …)는 `CLAUDE.md`에 한 줄씩 남아 있다. 여기에는 그 목록이 담을 수 없는
> **긴 것들**만 둔다 — 반복해서 틀리는 플랫폼별 빌드 절차와, 세션 기록 명령.

## Cross-Platform Wails 빌드 핵심 지침 (반복 실수 방지 — Windows, macOS, Linux)

1. **[공통] 빌드 에러 무조건 검증**: Wails CLI는 빌드 단계에서 실패해도 성공(SUCCESS)으로 로깅하고 에러 코드를 삼키는 버그가 있으므로, 빌드 실패 시 반드시 개별 셸 스크립트 실행 결과를 직접 확인하여 빌드 성공 유무 및 에러 상태 코드를 직접 검증하십시오.
2. **[Windows] WebView2 COM VTable Panic 회피**: go 1.26 윈도우 환경에서 COM DLL 바인딩 충돌로 인한 실행 패닉(`A dynamic link library (DLL) initialization routine failed`)을 영구 방어하기 위해, **반드시 `wails build -tags native_webview2loader` 빌드 플래그를 필수로 지정**하여 네이티브 로더를 사용하도록 컴파일하십시오.
3. **[공통] 실행 파일 쓰기 락 (Text File Busy) 우회**: 프로그램이 켜져 있는 상태에서 빌드하면 파일 쓰기 잠금 에러가 발생하므로, `-o mt_temp`로 임시 이름을 지정해 빌드한 뒤 최종 압축/패키징을 진행하고 임시 파일은 자가 소각(`rm` / `del`)하는 방식을 권장합니다.
4. **[공통] 엄격한 Go 컴파일 규칙**: Go 컴파일러는 미사용 패키지 임포트 및 괄호 밸런스 붕괴 시 즉시 컴파일 실패를 냅니다. 수정 후 반드시 로컬 헬스 체킹을 기동해 사전에 문법을 체크하십시오.
5. **[Windows] SmartScreen 대응 및 자연 평판 누적/오탐 등록**: 윈도우 Defender SmartScreen(인식할 수 없는 앱의 시작 차단)은 코드 서명 인증서 부재 및 초기 다운로드 평판 부족으로 발생합니다. 유료 인증서 없이 0원으로 대응할 때는 (1) 다운로드 웹페이지에 2단계 안내 가이드([추가 정보] ➔ [실행])를 제공하여 사용자가 정상 실행하도록 유도하고, (2) 릴리스 파이프라인에서 `scripts/release/submit-wdsi-helper.ps1`을 통해 Microsoft WDSI에 무료 분석을 신청하여 자연 평판(Reputation)을 누적합니다. 오탐 격리 방어를 위해 ZIP 병렬 출력도 유지합니다.
6. **[macOS] Gatekeeper 격리 방어 및 권한 우회**: 맥 환경에서 서명되지 않은 `.app` 실행 파일은 게이트키퍼(Gatekeeper)에 의해 실행이 원천 차단됩니다. 이를 로컬 우회하기 위해 빌드 직후 `xattr -cr <path_to_app>` 명령을 실행하여 속성을 정화해 주거나, 안전하게 `.dmg` / `.zip` 포맷으로 묶어서 배포하여야 합니다.
7. **[Linux] 실행 권한(`chmod +x`) 주입 및 상대 경로 보증**: 리눅스 컴파일 본은 빌드 완료 후 실행 권한이 누락될 수 있으므로, 빌드 자동화 단계에 반드시 `chmod +x` 스크립트를 동봉하여 락을 막으십시오.

크로스 빌드 자동화는 `scripts/loop/cross-build-wails.sh`에 있습니다.

## 지식베이스 프롬프트 자동 저장

에이전트는 사용자와의 세션을 완료하기 전(최종 답변 전), 사용자의 요청 프롬프트와
작업 이력을 `node scripts/loop/knowledge.ts add` 도구로 지식베이스에 기록합니다.

```bash
node scripts/loop/knowledge.ts add --title "[Agent Human Input] 요약" --tags "human,prompt" -- "프롬프트 원문"
```

중요 API 키나 시크릿 등 민감정보는 반드시 마스킹 후 저장합니다
(`scripts/loop/redact.ts`).

## UI/UX 사이드바 내비게이션 정렬 표준 (Sidebar Left-Alignment)

사이드바(Sidebar) 내비게이션 메뉴 및 목록 버튼은 반드시 **좌측 정렬(`justify-content: flex-start`, `text-align: left`)**을 적용해야 합니다.
- **원인 및 방어책**: CSS에서 범용 버튼(`button, .btn`)에 `display: inline-flex; justify-content: center;`를 부여하는 경우가 많아, `<button class="nav-btn">` 형태의 사이드바 메뉴가 의도치 않게 중앙 정렬되는 시각적 결함이 발생합니다.
- 사이드바 내비게이션 항목에는 반드시 명시적으로 `justify-content: flex-start; text-align: left;`를 선언하여 아이콘과 라벨 텍스트가 좌측에 정렬되도록 보장합니다.

