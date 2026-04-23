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

    button: {
      primaryStart: "#FF4D7E",
      primaryEnd: "#E11D48",
      primaryHoverStart: "#FF5C8A",
      primaryHoverEnd: "#F02458",
      primaryStroke: "#C81E4D",
      primaryGlow: "rgba(255,46,99,0.6)",
      primaryDepth: "#09090B",
      primaryHighlight: "rgba(255,255,255,0.28)",
      primaryLabel: "#FFFFFF",

      secondaryStart: "#2A2A33",
      secondaryEnd: "#1B1B23",
      secondaryHoverStart: "#34343E",
      secondaryHoverEnd: "#21212A",
      secondaryStroke: "#3B3B46",
      secondaryGlow: "#0F0F15",
      secondaryDepth: "#09090B",
      secondaryHighlight: "rgba(255,255,255,0.16)",
      secondaryLabel: "#F5F5F7",

      iconChip: "rgba(255,255,255,0.16)",
    },
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

    button: {
      primaryStart: "#F43F5E",
      primaryEnd: "#E11D48",
      primaryHoverStart: "#FB4B6B",
      primaryHoverEnd: "#F02A54",
      primaryStroke: "#BE123C",
      primaryGlow: "rgba(244,63,94,0.5)",
      primaryDepth: "#09090B",
      primaryHighlight: "rgba(255,255,255,0.26)",
      primaryLabel: "#FFFFFF",

      secondaryStart: "#FFFFFF",
      secondaryEnd: "#FFEFF3",
      secondaryHoverStart: "#FFFFFF",
      secondaryHoverEnd: "#FFE4EA",
      secondaryStroke: "#FBCFE8",
      secondaryGlow: "#F9A8D4",
      secondaryDepth: "#09090B",
      secondaryHighlight: "rgba(255,255,255,0.7)",
      secondaryLabel: "#1A1A1F",

      iconChip: "rgba(255,255,255,0.28)",
    },
  },
};
