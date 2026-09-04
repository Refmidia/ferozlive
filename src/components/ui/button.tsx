import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#FF2D95] to-[#C2185B] text-white hover:brightness-110 shadow-[0_12px_32px_rgba(233,30,99,0.38)]",
  secondary:
    "bg-[var(--sp-surface)] text-[var(--sp-text)] border border-[var(--sp-border)] hover:bg-[var(--sp-surface-hover)]",
  ghost: "bg-transparent text-[var(--sp-text-muted)] hover:bg-[var(--sp-primary-soft)] hover:text-[var(--sp-text)]",
  danger: "bg-[var(--sp-danger)] text-white hover:brightness-110",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
  icon: "h-11 w-11 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sp-focus)] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
