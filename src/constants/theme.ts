export type ThemeMode = "dark" | "light";

export interface AppThemePalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
}

export const themes: Record<ThemeMode, AppThemePalette> = {
  dark: {
    background: "#0C1220",
    surface: "#121B2D",
    surfaceMuted: "#1A2741",
    border: "#223457",
    text: "#EAF1FF",
    textMuted: "#9FB2D6",
    accent: "#4D84FF",
    accentSoft: "#1F3561",
  },
  light: {
    background: "#F2F6FF",
    surface: "#FFFFFF",
    surfaceMuted: "#E6EEFF",
    border: "#CBD9F5",
    text: "#0E1A30",
    textMuted: "#60789F",
    accent: "#2E67E8",
    accentSoft: "#D8E4FF",
  },
};
