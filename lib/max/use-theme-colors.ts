import { designCssVars } from "@/lib/design-system/theme";

type ThemeColors = {
  canvas: string;
  canvasAlt: string;
  panel: string;
  panelMuted: string;
  panelActive: string;
  lineSoft: string;
  lineSubtle: string;
  lineAccent: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  focus: string;
  overlay: string;
  gridOverlay: string;
  gradientCanvas: string;
  gradientPanel: string;
  gradientAccent: string;
  shadowGlow: string;
  shadowSoft: string;
  blurSurface: string;
  blurPanel: string;
  foreground: string;
  foregroundMuted: string;
  backgroundColor: string;
  accentColor: string;
  surfaceHover: string;
  secondaryBgColor: string;
  error: string;
};

const colors: ThemeColors = {
  canvas: designCssVars.colors.background,
  canvasAlt: designCssVars.colors.backgroundAlt,
  panel: designCssVars.colors.surface,
  panelMuted: designCssVars.colors.surfaceMuted,
  panelActive: designCssVars.colors.surfaceActive,
  lineSoft: designCssVars.colors.border,
  lineSubtle: designCssVars.colors.borderSubtle,
  lineAccent: designCssVars.colors.borderAccent,
  accent: designCssVars.colors.accent,
  accentStrong: designCssVars.colors.accentStrong,
  accentSoft: designCssVars.colors.accentSoft,
  accentText: designCssVars.colors.accentText,
  textPrimary: designCssVars.colors.textPrimary,
  textSecondary: designCssVars.colors.textSecondary,
  textMuted: designCssVars.colors.textMuted,
  success: designCssVars.colors.success,
  warning: designCssVars.colors.warning,
  danger: designCssVars.colors.danger,
  focus: designCssVars.colors.accentStrong,
  overlay: designCssVars.colors.overlay,
  gridOverlay: designCssVars.colors.gridOverlay,
  gradientCanvas: designCssVars.gradients.background,
  gradientPanel: designCssVars.gradients.surface,
  gradientAccent: designCssVars.gradients.accent,
  shadowGlow: designCssVars.shadows.glow,
  shadowSoft: designCssVars.shadows.soft,
  blurSurface: designCssVars.blur.surface,
  blurPanel: designCssVars.blur.panel,
  foreground: designCssVars.colors.textPrimary,
  foregroundMuted: designCssVars.colors.textSecondary,
  backgroundColor: designCssVars.gradients.background,
  accentColor: designCssVars.colors.accent,
  surfaceHover: designCssVars.colors.surfaceMuted,
  secondaryBgColor: designCssVars.colors.surfaceMuted,
  error: designCssVars.colors.danger,
};

export const useThemeColors = (): ThemeColors => colors;
