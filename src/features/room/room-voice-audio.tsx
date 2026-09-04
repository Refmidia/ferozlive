"use client";

import { RoomAudioRenderer } from "@livekit/components-react";

export function RoomVoiceAudio({ muted }: { muted: boolean }) {
  if (muted) {
    return null;
  }

  return <RoomAudioRenderer volume={1} />;
}
