"use client";

import type { RefObject } from "react";
import { Track } from "livekit-client";
import { VideoTrack, useTracks } from "@livekit/components-react";
import { Crown } from "lucide-react";
import { EmptyStage } from "@/features/room/empty-stage";
import { parseParticipantMetadata } from "@/types/participant";

export function RoomStage({
  fullscreenRef,
  onShare,
  onCopyLink,
  canShare,
  localSharing = false,
  displayName,
  isHost = false,
  speaking = false,
}: {
  fullscreenRef: RefObject<HTMLDivElement | null>;
  onShare?: () => void;
  onCopyLink?: () => void;
  canShare?: boolean;
  localSharing?: boolean;
  displayName?: string;
  isHost?: boolean;
  speaking?: boolean;
}) {
  const tracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  const video = tracks.find(
    (track) => track.source === Track.Source.ScreenShare && track.publication?.track,
  );
  const sharerName =
    parseParticipantMetadata(video?.participant.metadata)?.displayName ??
    video?.participant.name ??
    "Alguém";
  const hasShare = Boolean(video?.publication);

  return (
    <div
      ref={fullscreenRef}
      className="relative h-full min-h-[420px] overflow-hidden bg-[#07050c]"
    >
      {!hasShare ? (
        <>
          <div
            className="room-bg-zoom absolute -inset-[6%] bg-cover bg-no-repeat"
            style={{
              backgroundImage: "url('/room-bg-feroz.jpg')",
              backgroundPosition: "right top",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,12,0.78)_0%,rgba(7,5,12,0.45)_48%,rgba(7,5,12,0.22)_100%),linear-gradient(180deg,rgba(7,5,12,0.2)_0%,rgba(7,5,12,0.5)_100%)]"
            aria-hidden
          />
        </>
      ) : null}

      {hasShare && video?.publication ? (
        <>
          <div
            className={`absolute inset-3 overflow-hidden rounded-xl bg-black ${
              hasShare
                ? "shadow-[0_0_0_2px_#F5C16C,0_0_28px_rgba(245,193,108,0.35)]"
                : ""
            }`}
          >
            <VideoTrack
              trackRef={video}
              className="h-full w-full object-contain [&_video]:h-full [&_video]:w-full [&_video]:object-contain"
            />
          </div>

          {!localSharing ? (
            <p className="absolute left-5 top-5 z-10 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {sharerName} está transmitindo
            </p>
          ) : null}

          {localSharing && displayName ? (
            <div className="pointer-events-none absolute bottom-4 left-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c0812]/92 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              {isHost ? <Crown className="h-3.5 w-3.5 text-[#F5C16C]" aria-hidden /> : null}
              <span className="text-sm font-medium text-white">{displayName}</span>
              <span className="rounded-md bg-[var(--sp-primary-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FF2D95]">
                Você
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  speaking ? "animate-pulse bg-[#3DDC97] shadow-[0_0_10px_rgba(61,220,151,0.8)]" : "bg-[#3DDC97]"
                }`}
                aria-hidden
              />
            </div>
          ) : null}
        </>
      ) : (
        <EmptyStage onShare={onShare} onCopyLink={onCopyLink} canShare={canShare} />
      )}
    </div>
  );
}
