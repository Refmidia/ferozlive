import { limits } from "@/config/limits";

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const MULTI_SPACE = /\s+/g;

export function sanitizeDisplayName(input: string): string {
  return input
    .replace(CONTROL_CHARS, " ")
    .replace(MULTI_SPACE, " ")
    .trim()
    .slice(0, limits.displayNameMax);
}

export function sanitizeOptionalPassword(input: string | undefined): string | undefined {
  if (input === undefined) {
    return undefined;
  }

  const trimmed = input.replace(CONTROL_CHARS, "").trim();
  return trimmed.length > 0 ? trimmed.slice(0, limits.passwordMax) : undefined;
}
