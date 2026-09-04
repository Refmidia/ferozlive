import type { ScreenShareCaptureOptions, TrackPublishOptions } from "livekit-client";
import { qualityFallbackChain, getQualityPreset } from "@/config/quality";
import type { QualityPresetId } from "@/types/room";

export function canCaptureDisplay(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function"
  );
}

export function buildScreenShareOptions(
  quality: QualityPresetId,
): ScreenShareCaptureOptions {
  const preset = getQualityPreset(quality);

  return {
    audio: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "include",
    systemAudio: "include",
    contentHint: "detail",
    resolution: preset.width
      ? {
          width: preset.width,
          height: preset.height ?? 720,
          frameRate: preset.frameRate ?? 30,
        }
      : undefined,
  };
}

export function buildPublishOptions(quality: QualityPresetId): TrackPublishOptions {
  const preset = getQualityPreset(quality);
  const frameRate = preset.frameRate ?? 30;
  const maxBitrate = preset.height && preset.height >= 1080 ? 4_500_000 : 2_500_000;

  return {
    simulcast: true,
    dtx: true,
    red: true,
    screenShareEncoding: {
      maxBitrate,
      maxFramerate: frameRate,
    },
  };
}

export function nextQualityFallback(current: QualityPresetId): QualityPresetId | null {
  const chain = qualityFallbackChain(current);
  return chain[1] ?? null;
}
