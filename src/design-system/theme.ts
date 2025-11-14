import { cssVars, tokens } from "./tokens";

type TokenMap = Record<string, string>;

const setVariables = (namespace: string, values: TokenMap) => {
  if (typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;

  Object.entries(values).forEach(([key, value]) => {
    const kebabKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    root.style.setProperty(`--ds-${namespace}-${kebabKey}`, value);
  });
};

export const applyDesignTheme = () => {
  setVariables("color", tokens.colors);
  setVariables("gradient", tokens.gradients);
  setVariables("radius", tokens.radii);
  setVariables("shadow", tokens.shadows);
  setVariables("blur", tokens.blur);
};

export const designTokens = tokens;
export const designCssVars = cssVars;
