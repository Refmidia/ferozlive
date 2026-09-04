"use client";

import { useSyncExternalStore } from "react";
import { canCaptureDisplay } from "@/lib/livekit/screen-share";

export function useScreenShareSupport() {
  return useSyncExternalStore(
    () => () => undefined,
    canCaptureDisplay,
    () => false,
  );
}
