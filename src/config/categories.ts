export const SUPPORT_CATEGORIES = [
  { id: "ocorrencia", label: "Ocorrência na cidade" },
  { id: "instalacao", label: "Instalação / entrada" },
  { id: "anticheat", label: "Anti-cheat / telagem" },
  { id: "outro", label: "Outro" },
] as const;

export type SupportCategoryId = (typeof SUPPORT_CATEGORIES)[number]["id"];
export type SupportStatus = "open" | "in_progress" | "resolved";

export const SUPPORT_STATUSES: { id: SupportStatus; label: string }[] = [
  { id: "open", label: "Aberto" },
  { id: "in_progress", label: "Em atendimento" },
  { id: "resolved", label: "Resolvido" },
];

export function categoryLabel(id: string) {
  return SUPPORT_CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

export function statusLabel(id: string) {
  return SUPPORT_STATUSES.find((item) => item.id === id)?.label ?? id;
}
