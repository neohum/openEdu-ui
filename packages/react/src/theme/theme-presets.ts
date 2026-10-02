export type ThemeId = "chalkboard" | "paper" | "violet" | "emerald" | "amber";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  bg: string;
  fg: string;
  accent: string;
  secondaryAccent?: string;
  surface: string;
}

export const THEME_PRESETS: Record<ThemeId, ThemePreset> = {
  chalkboard: {
    id: "chalkboard",
    name: "칠판 딥그린",
    description: "전통적인 교실 칠판 느낌의 몰입형 딥그린 테마",
    bg: "#0f291e", // lint-ignore
    fg: "#ffffff", // lint-ignore
    accent: "#fde047", // lint-ignore
    secondaryAccent: "#4ade80", // lint-ignore
    surface: "#133827", // lint-ignore
  },
  paper: {
    id: "paper",
    name: "클린 화이트",
    description: "학습지와 교재 느낌의 깨끗하고 선명한 화이트 테마",
    bg: "#ffffff", // lint-ignore
    fg: "#0f172a", // lint-ignore
    accent: "#4f46e5", // lint-ignore
    surface: "#f8fafc", // lint-ignore
  },
  violet: {
    id: "violet",
    name: "네온 바이올렛",
    description: "classbook 스타일의 현대적이고 감각적인 바이올렛 테마",
    bg: "#0f172a", // lint-ignore
    fg: "#ffffff", // lint-ignore
    accent: "#8b5cf6", // lint-ignore
    surface: "#1e1b4b", // lint-ignore
  },
  emerald: {
    id: "emerald",
    name: "에코 에메랄드",
    description: "눈이 편안하고 차분한 자연주의 에메랄드 테마",
    bg: "#064e3b", // lint-ignore
    fg: "#ffffff", // lint-ignore
    accent: "#10b981", // lint-ignore
    surface: "#065f46", // lint-ignore
  },
  amber: {
    id: "amber",
    name: "집중형 웜 앰버",
    description: "독서실 및 심야 학습에 최적화된 따뜻한 다크 앰버 테마",
    bg: "#1c1917", // lint-ignore
    fg: "#ffffff", // lint-ignore
    accent: "#f59e0b", // lint-ignore
    surface: "#292524", // lint-ignore
  },
};
