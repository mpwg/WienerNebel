export const designTokens = {
  colors: {
    canvas: "#efe6d8",
    surface: "#f7f0e6",
    panel: "#efe3d1",
    accent: "#7a1f1f",
    accentSoft: "#c98f7a",
    text: "#1d1b1a",
    textMuted: "#5f5a54"
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radii: {
    sm: 10,
    md: 18,
    lg: 28
  },
  shadows: {
    panel: "0 22px 60px rgba(45, 25, 15, 0.14)"
  },
  typography: {
    display: "\"Fraunces\", Georgia, serif",
    body: "\"Space Grotesk\", \"Avenir Next\", \"Segoe UI\", sans-serif"
  }
} as const;

export type DesignTokens = typeof designTokens;
