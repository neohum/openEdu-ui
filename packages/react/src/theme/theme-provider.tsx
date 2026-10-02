import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type CSSProperties,
  type ElementType,
  type ComponentPropsWithoutRef,
} from "react";
import { THEME_PRESETS, type ThemeId, type ThemePreset } from "./theme-presets.ts";

export interface EduThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  customAccent?: string;
  setCustomAccent: (accent?: string) => void;
  preset?: ThemePreset;
  presets: Record<ThemeId, ThemePreset>;
}

const EduThemeContext = createContext<EduThemeContextValue | null>(null);

export function useEduTheme(): EduThemeContextValue {
  const context = useContext(EduThemeContext);
  if (!context) {
    throw new Error("useEduTheme must be used within an EduThemeProvider");
  }
  return context;
}

export type EduThemeProviderProps<T extends ElementType = "div"> = {
  theme?: string;
  defaultTheme?: string;
  customAccent?: string;
  defaultCustomAccent?: string;
  onThemeChange?: (theme: string) => void;
  onCustomAccentChange?: (accent?: string) => void;
  children: ReactNode;
  as?: T;
  className?: string;
  style?: CSSProperties;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "style" | "className" | "children">;

export function EduThemeProvider<T extends ElementType = "div">({
  theme: controlledTheme,
  defaultTheme = "chalkboard",
  customAccent: controlledAccent,
  defaultCustomAccent,
  onThemeChange,
  onCustomAccentChange,
  children,
  as,
  className,
  style,
  ...rest
}: EduThemeProviderProps<T>) {
  const Component = as || "div";

  const isThemeControlled = controlledTheme !== undefined;
  const [internalTheme, setInternalTheme] = useState<string>(defaultTheme);
  const currentTheme = isThemeControlled ? controlledTheme : internalTheme;

  const isAccentControlled = controlledAccent !== undefined;
  const [internalAccent, setInternalAccent] = useState<string | undefined>(defaultCustomAccent);
  const currentAccent = isAccentControlled ? controlledAccent : internalAccent;

  const setTheme = (nextTheme: string) => {
    if (!isThemeControlled) {
      setInternalTheme(nextTheme);
    }
    onThemeChange?.(nextTheme);
  };

  const setCustomAccent = (nextAccent?: string) => {
    if (!isAccentControlled) {
      setInternalAccent(nextAccent);
    }
    onCustomAccentChange?.(nextAccent);
  };

  const preset = THEME_PRESETS[currentTheme as ThemeId];

  // Resolve CSS Variables
  const bg = preset?.bg ?? "inherit";
  const fg = preset?.fg ?? "inherit";
  const accent = currentAccent || preset?.accent || "inherit";
  const surface = preset?.surface ?? "inherit";

  const themeStyle: CSSProperties = {
    "--oe-theme-bg": bg,
    "--oe-theme-fg": fg,
    "--oe-theme-accent": accent,
    "--oe-theme-surface": surface,
    backgroundColor: "var(--oe-theme-bg)",
    color: "var(--oe-theme-fg)",
    ...style,
  } as CSSProperties;

  const contextValue = useMemo<EduThemeContextValue>(
    () => ({
      theme: currentTheme,
      setTheme,
      customAccent: currentAccent,
      setCustomAccent,
      preset,
      presets: THEME_PRESETS,
    }),
    [currentTheme, currentAccent, preset]
  );

  return (
    <EduThemeContext.Provider value={contextValue}>
      <Component
        {...(rest as any)}
        data-theme={currentTheme}
        className={["oe-theme-root", className].filter(Boolean).join(" ")}
        style={themeStyle}
      >
        {children}
      </Component>
    </EduThemeContext.Provider>
  );
}
