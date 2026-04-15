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
    background: "#0B0F14", // near black (premium)
    surface: "#121821", // card bg
    surfaceMuted: "#1A2230", // subtle layers
    border: "#263042", // soft border

    text: "#F8FAFC", // clean white
    textMuted: "#9AA4B2", // muted gray

    accent: "#00E676", // neon green 🔥
    accentSoft: "#00C853", // darker green
  },

  light: {
    background: "#F9FBF9", // near white (soft green tint)
    surface: "#FFFFFF", // clean cards
    surfaceMuted: "#F1F5F3", // subtle bg sections
    border: "#E2E8F0", // soft border

    text: "#0F172A", // dark text
    textMuted: "#64748B", // muted gray

    accent: "#16A34A", // strong green
    accentSoft: "#22C55E", // lighter green
  },
};
