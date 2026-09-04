"use client";

import { qualityPresets } from "@/config/quality";
import type { QualityPresetId } from "@/types/room";

export function QualitySelect({
  value,
  onChange,
}: {
  value: QualityPresetId;
  onChange: (value: QualityPresetId) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--sp-text-muted)]">
      <span className="sr-only">Qualidade da transmissão</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as QualityPresetId)}
        className="min-h-11 rounded-2xl border border-[var(--sp-border)] bg-[rgba(10,10,18,0.72)] px-3 text-[var(--sp-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sp-focus)]"
        aria-label="Qualidade da transmissão"
      >
        {qualityPresets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
    </label>
  );
}
