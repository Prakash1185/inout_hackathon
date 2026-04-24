export const themes: Record<ThemeMode, AppThemePalette> = {
  dark: {
    background: "#0E0C14",
    surface: "#16131D",
    surfaceMuted: "#1E1A26",
    border: "rgba(255,255,255,0.08)",

    text: "#F6F4FA",
    textMuted: "#A8A3B3",

    accent: "#8B5CF6",
    accentSoft: "#A78BFA",

    button: {
      primaryStart: "#8B5CF6",
      primaryEnd: "#6D28D9",
      primaryHoverStart: "#9B6CFF",
      primaryHoverEnd: "#7C3AED",
      primaryStroke: "rgba(139,92,246,0.35)",
      primaryGlow: "transparent",
      primaryDepth: "#09070F",
      primaryHighlight: "rgba(255,255,255,0.22)",
      primaryLabel: "#FFFFFF",

      secondaryStart: "#201B2A",
      secondaryEnd: "#171320",
      secondaryHoverStart: "#282233",
      secondaryHoverEnd: "#1D1826",
      secondaryStroke: "rgba(255,255,255,0.08)",
      secondaryGlow: "transparent",
      secondaryDepth: "#09070F",
      secondaryHighlight: "rgba(255,255,255,0.08)",
      secondaryLabel: "#EDE9FE",

      iconChip: "rgba(255,255,255,0.08)",
    },
  },

  light: {
    background: "#FBFAFF",
    surface: "#FFFFFF",
    surfaceMuted: "#F3F0FF",
    border: "rgba(0,0,0,0.06)",

    text: "#1A1625",
    textMuted: "#6B6680",

    accent: "#8B5CF6",
    accentSoft: "#C4B5FD",

    button: {
      primaryStart: "#8B5CF6",
      primaryEnd: "#6D28D9",
      primaryHoverStart: "#9B6CFF",
      primaryHoverEnd: "#7C3AED",
      primaryStroke: "rgba(139,92,246,0.28)",
      primaryGlow: "transparent",
      primaryDepth: "#0E0C14",
      primaryHighlight: "rgba(255,255,255,0.35)",
      primaryLabel: "#FFFFFF",

      secondaryStart: "#FFFFFF",
      secondaryEnd: "#F3F0FF",
      secondaryHoverStart: "#FFFFFF",
      secondaryHoverEnd: "#EAE5FF",
      secondaryStroke: "rgba(0,0,0,0.06)",
      secondaryGlow: "transparent",
      secondaryDepth: "#0E0C14",
      secondaryHighlight: "rgba(255,255,255,0.9)",
      secondaryLabel: "#1A1625",

      iconChip: "rgba(0,0,0,0.05)",
    },
  },
};
