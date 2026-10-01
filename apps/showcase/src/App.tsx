import { paper } from "@openedu/content";
import samplePaper from "../../../packages/content/src/samples/paper.json";
import {
  AdaptiveDock, AnnotatableText, BaseTenBlocks, Button, Card, Cluster, Dialog, ExamNavigator, FocusCurtain, FractionBar,
  Grid, Icon, IconButton, Input, ItemRenderer, NumberLine, RadialMenu, SplitBoard, Stack, TestPaperLayout, Tooltip,
  type Answers,
} from "@openedu/react";
import { useEffect, useState } from "react";

const SURFACES = ["board", "desktop", "mobile", "print"] as const;
type Surface = (typeof SURFACES)[number];
const SWATCHES = ["bg", "surface", "surface-sunken", "fg", "fg-muted", "border", "accent", "danger", "success"] as const;
const data = paper.parse(samplePaper);

function useParam<T extends string>(name: string, allowed: readonly T[], fallback: T): [T, (v: T) => void] {
  const read = () => {
    const v = new URLSearchParams(window.location.search).get(name) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  };
  const [value, setValue] = useState<T>(read);
  const set = (v: T) => {
    const url = new URL(window.location.href);
    url.searchParams.set(name, v);
    window.history.replaceState(null, "", url);
    setValue(v);
  };
  return [value, set];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sc-section">
      <h2 className="sc-section__title">{title}</h2>
      {children}
    </section>
  );
}

export function App() {
  const [surface, setSurface] = useParam<Surface>("surface", SURFACES, "desktop");
  const [theme, setTheme] = useParam<"light" | "dark">("theme", ["light", "dark"], "light");
  useEffect(() => {
    document.documentElement.dataset.surface = surface;
    document.documentElement.dataset.theme = theme;
  }, [surface, theme]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [highlights, setHighlights] = useState<{ start: number; end: number }[]>([]);
  const [count, setCount] = useState(7);

  return (
    <div className="sc-page">
      <header className="sc-header">
        <a className="sc-brand" href="/" aria-label="openEdu-ui">
          <img src="/favicon.svg" alt="" className="sc-logo" />
          <span className="sc-wordmark">open<span className="sc-wordmark__edu">Edu</span>-ui</span>
        </a>
        <Cluster gap={2} role="group" aria-label="표면 선택">
          {SURFACES.map((s) => (
            <Button key={s} size="sm" variant={s === surface ? "primary" : "secondary"} aria-pressed={s === surface} onClick={() => setSurface(s)}>
              {s}
            </Button>
          ))}
        </Cluster>
        <IconButton icon={theme === "light" ? "moon" : "sun"} label={theme === "light" ? "다크 테마" : "라이트 테마"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} />
      </header>

      <main className="sc-main">
        <Section title="디자인 토큰">
          <div className="sc-swatches">
            {SWATCHES.map((name) => (
              <div key={name} className="sc-swatch">
                <span className="sc-swatch__chip" style={{ background: `var(--color-${name})` }} />
                <code>{name}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="기본 컴포넌트">
          <Grid minColumn="20rem">
            <Card>
              <Stack>
                <Input label="이름" hint="수업에서 부를 이름" />
                <Input label="이메일" error="형식이 올바르지 않습니다" />
                <Cluster>
                  <Button>저장</Button>
                  <Button variant="secondary">취소</Button>
                  <Button variant="danger">삭제</Button>
                  <Button loading>전송</Button>
                </Cluster>
              </Stack>
            </Card>
            <Card>
              <Stack>
                <Cluster>
                  <Tooltip label="새 문제 추가"><IconButton icon="plus" label="추가" variant="secondary" /></Tooltip>
                  <IconButton icon="pencil-simple" label="수정" variant="secondary" />
                  <IconButton icon="trash" label="삭제" variant="danger" />
                </Cluster>
                <Button variant="ghost" onClick={() => setDialogOpen(true)}><Icon name="info" /> 대화상자 열기</Button>
              </Stack>
            </Card>
          </Grid>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="정답을 제출할까요?" description="제출하면 수정할 수 없습니다.">
            <Button onClick={() => setDialogOpen(false)}>제출</Button>
          </Dialog>
        </Section>

        <Section title="문제지">
          <TestPaperLayout
            passage={<AnnotatableText text={data.passages[0]!.content} highlights={highlights} onHighlightsChange={setHighlights} />}
            passageLabel={data.passages[0]!.title}
            questions={data.items.slice(0, 2).map((item, i) => (
              <ItemRenderer key={item.id} item={item} number={i + 1} value={answers[item.id]} onChange={(v) => setAnswers((a) => ({ ...a, [item.id]: v }))} />
            ))}
            navigator={<ExamNavigator items={data.items} answers={answers} visited={data.items.slice(0, 2).map((i) => i.id)} remainingSeconds={1500} />}
          />
        </Section>

        <Section title="가상 교구">
          <Grid minColumn="20rem">
            <Card><BaseTenBlocks value={count} onChange={setCount} /></Card>
            <Card><Stack><NumberLine min={0} max={10} value={Math.min(count, 10)} onChange={setCount} /><FractionBar denominator={4} defaultValue={3} /></Stack></Card>
          </Grid>
        </Section>

        <Section title="전자칠판">
          <Stack>
            <Cluster>
              <Button variant="secondary" onClick={(e) => setMenu({ x: e.clientX, y: e.clientY })}><Icon name="pencil-simple" /> 방사형 메뉴 열기</Button>
            </Cluster>
            <Card>
              <FocusCurtain label="정답 가림막" defaultValue={0.4}>
                <p className="sc-curtain-content">정답: 직접 문장을 따라 쓰며 구조를 익히는 것이 중요하다.</p>
              </FocusCurtain>
            </Card>
            <div className="sc-split">
              <SplitBoard zones={2} label="모둠 활동" renderZone={(i) => <p>모둠 {i + 1}의 풀이 공간</p>} renderFooter={(i) => <Button size="sm">모둠 {i + 1} 제출</Button>} />
            </div>
          </Stack>
          <RadialMenu
            open={menu !== null}
            origin={menu ?? { x: 0, y: 0 }}
            label="도구"
            items={[{ id: "pen", label: "펜", icon: "pencil-simple" }, { id: "erase", label: "지우개", icon: "eraser" }, { id: "undo", label: "되돌리기", icon: "arrow-u-up-left" }]}
            onSelect={() => {}}
            onClose={() => setMenu(null)}
          />
        </Section>
      </main>

      <footer className="sc-footer">
        <p>아이콘: Phosphor Icons (MIT).</p>
      </footer>
      <AdaptiveDock label="칠판 도구">
        <IconButton icon="pencil-simple" label="펜" variant="secondary" />
        <IconButton icon="eraser" label="지우개" variant="secondary" />
        <IconButton icon="arrow-u-up-left" label="되돌리기" variant="secondary" />
      </AdaptiveDock>
    </div>
  );
}
