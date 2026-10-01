import { dockPosition, nearestSide, type HeightPreset, type Side } from "@openedu/core";
import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { IconButton } from "../primitives/button.tsx";
import { useViewport, type Viewport } from "./use-viewport.ts";

export type AdaptiveDockProps = {
  label: string;
  children: ReactNode;
  side?: Side;
  defaultSide?: Side;
  onSideChange?: (side: Side) => void;
  preset?: HeightPreset;
  defaultPreset?: HeightPreset;
  onPresetChange?: (preset: HeightPreset) => void;
  /** Overrides the measured window size (tests, embedded boards). */
  viewport?: Viewport;
  /** Approximate dock size used for placement. */
  dockSize?: { width: number; height: number };
  labels?: { adult: string; child: string; move: string };
};

const DEFAULT_SIZE = { width: 480, height: 96 };

/** Toolbar that stays in the bottom third, snaps to either side, and has adult/child heights. */
export function AdaptiveDock({
  label,
  children,
  side: sideProp,
  defaultSide = "left",
  onSideChange,
  preset: presetProp,
  defaultPreset = "adult",
  onPresetChange,
  viewport: viewportProp,
  dockSize = DEFAULT_SIZE,
  labels = { adult: "교사 높이", child: "학생 높이", move: "독 위치 이동" },
}: AdaptiveDockProps) {
  const measured = useViewport();
  const viewport = viewportProp ?? measured;
  const [sideState, setSide] = useState<Side>(defaultSide);
  const [presetState, setPreset] = useState<HeightPreset>(defaultPreset);
  const side = sideProp ?? sideState;
  const preset = presetProp ?? presetState;

  const changeSide = (next: Side) => {
    setSide(next);
    onSideChange?.(next);
  };
  const changePreset = (next: HeightPreset) => {
    setPreset(next);
    onPresetChange?.(next);
  };

  const { x, y } = dockPosition({ viewport, dock: dockSize, side, preset });
  const style = { "--oe-dock-x": `${x}px`, "--oe-dock-y": `${y}px` } as CSSProperties;

  const onHandleUp = (e: PointerEvent<HTMLButtonElement>) => changeSide(nearestSide(e.clientX, viewport.width));
  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft") changeSide("left");
    if (e.key === "ArrowRight") changeSide("right");
  };

  return (
    <div role="toolbar" aria-label={label} className="oe-dock" data-side={side} data-preset={preset} style={style}>
      <IconButton icon="arrows-out-cardinal" label={labels.move} onPointerUp={onHandleUp} onKeyDown={onHandleKey} />
      <div className="oe-dock__tools">{children}</div>
      <IconButton
        icon={preset === "adult" ? "arrow-down" : "arrow-up"}
        label={preset === "adult" ? labels.child : labels.adult}
        onClick={() => changePreset(preset === "adult" ? "child" : "adult")}
      />
    </div>
  );
}
