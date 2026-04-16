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
    background: "#0A0A0D",
    surface: "#141419",
    surfaceMuted: "#1C1C23",
    border: "#2A2A33",

    text: "#F5F5F7",
    textMuted: "#A1A1AA",

    accent: "#FF2E63",
    accentSoft: "#FF4D7E",
  },

  light: {
    background: "#FFF7F9",
    surface: "#FFFFFF",
    surfaceMuted: "#FFEFF3",
    border: "#F3D6DC",

    text: "#1A1A1F",
    textMuted: "#6B6B76",

    accent: "#E11D48",
    accentSoft: "#F43F5E",
  },
};
