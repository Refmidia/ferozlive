import type { QualityPreset, QualityPresetId } from "@/types/room";

export const qualityPresets: QualityPreset[] = [
  { id: "auto", label: "Automática" },
  { id: "720p30", label: "720p · 30 FPS", width: 1280, height: 720, frameRate: 30 },
  { id: "720p60", label: "720p · 60 FPS", width: 1280, height: 720, frameRate: 60 },
  { id: "1080p30", label: "1080p · 30 FPS", width: 1920, height: 1080, frameRate: 30 },
  { id: "1080p60", label: "1080p · 60 FPS", width: 1920, height: 1080, frameRate: 60 },
];

export const DEFAULT_QUALITY: QualityPresetId = "auto";

export function getQualityPreset(id: QualityPresetId): QualityPreset {
  return qualityPresets.find((preset) => preset.id === id) ?? qualityPresets[0]!;
}

export function qualityFallbackChain(id: QualityPresetId): QualityPresetId[] {
  const order: QualityPresetId[] = [id, "1080p30", "720p30", "auto"];
  return [...new Set(order)];
}
