export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeRoomCode(input: string): string {
  const compact = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  if (compact.length !== 8) {
    return compact;
  }

  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

export function isValidRoomCodeFormat(code: string): boolean {
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(
    code,
  );
}
