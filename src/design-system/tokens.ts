export type ColorToken =
  | "background"
  | "backgroundAlt"
  | "surface"
  | "surfaceMuted"
  | "surfaceActive"
  | "border"
  | "borderSubtle"
  | "borderAccent"
  | "accent"
  | "accentStrong"
  | "accentSoft"
  | "accentText"
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "success"
  | "warning"
  | "danger"
  | "overlay"
  | "gridOverlay";

export type GradientToken = "background" | "surface" | "accent";

export type RadiusToken = "xs" | "sm" | "md" | "lg" | "xl" | "pill";
export type ShadowToken = "glow" | "soft" | "inner";
export type BlurToken = "surface" | "panel";

const BASE_COLORS: Record<ColorToken, string> = {
  background: "#02040a",
  backgroundAlt: "#060e1f",
  surface: "rgba(9, 24, 44, 0.72)",
  surfaceMuted: "rgba(10, 20, 36, 0.54)",
  surfaceActive: "rgba(16, 44, 80, 0.78)",
  border: "rgba(78, 165, 255, 0.2)",
  borderSubtle: "rgba(78, 165, 255, 0.12)",
  borderAccent: "rgba(97, 247, 255, 0.35)",
  accent: "#61f7ff",
  accentStrong: "#37c8ff",
  accentSoft: "rgba(97, 247, 255, 0.18)",
  accentText: "#00131d",
  textPrimary: "#f0faff",
  textSecondary: "#8fa8c9",
  textMuted: "#557192",
  success: "#48e0b5",
  warning: "#fed970",
  danger: "#ff7a9a",
  overlay: "rgba(3, 12, 24, 0.72)",
  gridOverlay: "rgba(6, 20, 40, 0.4)",
};

const BASE_GRADIENTS: Record<GradientToken, string> = {
  background:
    "radial-gradient(85% 120% at 50% -10%, rgba(97, 247, 255, 0.18) 0%, rgba(2, 4, 10, 0) 65%), #02040a",
  surface:
    "linear-gradient(150deg, rgba(18, 104, 164, 0.28) 0%, rgba(8, 28, 58, 0.86) 60%, rgba(2, 10, 24, 0.92) 100%)",
  accent: "linear-gradient(130deg, #61f7ff 0%, #37c8ff 45%, #6a53ff 100%)",
};

const RADII: Record<RadiusToken, string> = {
  xs: "6px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "28px",
  pill: "999px",
};

const SHADOWS: Record<ShadowToken, string> = {
  glow: "0 30px 60px rgba(22, 130, 200, 0.45)",
  soft: "0 20px 40px rgba(2, 10, 24, 0.6)",
  inner: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
};

const BLUR: Record<BlurToken, string> = {
  surface: "24px",
  panel: "38px",
};

export const tokens = {
  colors: BASE_COLORS,
  gradients: BASE_GRADIENTS,
  radii: RADII,
  shadows: SHADOWS,
  blur: BLUR,
  typography: {
    display: "var(--font-display)",
    body: "var(--font-body)",
    mono: "var(--font-geist-mono)",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    xxl: "2rem",
  },
} as const;

export type DesignTokens = typeof tokens;

const mapToCssVariables = <T extends string>(
  prefix: string,
  values: Record<T, string>,
): Record<T, string> => {
  return Object.keys(values).reduce(
    (acc, key) => {
      const typedKey = key as T;
      acc[typedKey] =
        `var(--ds-${prefix}-${typedKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)})`;
      return acc;
    },
    {} as Record<T, string>,
  );
};

export const cssVars = {
  colors: mapToCssVariables("color", BASE_COLORS),
  gradients: mapToCssVariables("gradient", BASE_GRADIENTS),
  radii: mapToCssVariables("radius", RADII),
  shadows: mapToCssVariables("shadow", SHADOWS),
  blur: mapToCssVariables("blur", BLUR),
} as const;

export type CssVarRef = typeof cssVars;
