export const brand = {
  name: "Feroz City",
  shortName: "FC",
  product: "Central de suporte",
  tagline: "Mostre o problema. A staff resolve com você.",
  description:
    "Compartilhe sua tela com segurança e receba suporte da equipe Feroz City em tempo real.",
  locale: "pt-BR",
  logoSrc: "/feroz-city-mark.png",
  colors: {
    background: "#05030A",
    backgroundAlt: "#0B0614",
    surface: "rgba(18, 10, 28, 0.78)",
    surfaceSolid: "#140A1C",
    surfaceHover: "rgba(36, 16, 52, 0.9)",
    border: "rgba(168, 85, 247, 0.28)",
    borderStrong: "rgba(255, 45, 149, 0.42)",
    primary: "#E91E63",
    primaryHover: "#FF4B88",
    primarySoft: "rgba(233, 30, 99, 0.16)",
    accent: "#FF2D95",
    accentSoft: "rgba(255, 45, 149, 0.16)",
    text: "#F7F4FB",
    textMuted: "#B8A8C9",
    textSubtle: "#7E6E90",
    success: "#3DDC97",
    warning: "#F5C16C",
    danger: "#FF4D6D",
    focus: "#FF4DB2",
  },
} as const;

export type BrandColors = typeof brand.colors;

export function brandCssVars(): Record<string, string> {
  return {
    "--sp-bg": brand.colors.background,
    "--sp-bg-alt": brand.colors.backgroundAlt,
    "--sp-surface": brand.colors.surface,
    "--sp-surface-solid": brand.colors.surfaceSolid,
    "--sp-surface-hover": brand.colors.surfaceHover,
    "--sp-border": brand.colors.border,
    "--sp-border-strong": brand.colors.borderStrong,
    "--sp-primary": brand.colors.primary,
    "--sp-primary-hover": brand.colors.primaryHover,
    "--sp-primary-soft": brand.colors.primarySoft,
    "--sp-accent": brand.colors.accent,
    "--sp-accent-soft": brand.colors.accentSoft,
    "--sp-text": brand.colors.text,
    "--sp-text-muted": brand.colors.textMuted,
    "--sp-text-subtle": brand.colors.textSubtle,
    "--sp-success": brand.colors.success,
    "--sp-warning": brand.colors.warning,
    "--sp-danger": brand.colors.danger,
    "--sp-focus": brand.colors.focus,
  };
}
