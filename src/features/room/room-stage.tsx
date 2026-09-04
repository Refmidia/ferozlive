"use client";

import type { RefObject } from "react";
import { Track } from "livekit-client";
import { AudioTrack, VideoTrack, useTracks } from "@livekit/components-react";
import { EmptyStage } from "@/features/room/empty-stage";
import { parseParticipantMetadata } from "@/types/participant";

export function RoomStage({
  fullscreenRef,
  onShare,
  onCopyLink,
  canShare,
}: {
  fullscreenRef: RefObject<HTMLDivElement | null>;
  onShare?: () => void;
  onCopyLink?: () => void;
  canShare?: boolean;
}) {
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.ScreenShareAudio, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const video = tracks.find(
    (track) => track.source === Track.Source.ScreenShare && track.publication?.track,
  );
  const audios = tracks.filter((track) => track.source === Track.Source.ScreenShareAudio);
  const sharerName =
    parseParticipantMetadata(video?.participant.metadata)?.displayName ??
    video?.participant.name ??
    "Alguém";

  return (
    <div
      ref={fullscreenRef}
      className="relative h-full min-h-[420px] overflow-hidden bg-[#07050c]"
    >
      {video?.publication ? (
        <>
          <VideoTrack trackRef={video} className="h-full w-full object-contain" />
          <p className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {sharerName} está transmitindo
          </p>
        </>
      ) : (
        <EmptyStage onShare={onShare} onCopyLink={onCopyLink} canShare={canShare} />
      )}
      {audios.map((track) =>
        track.publication ? (
          <AudioTrack
            key={`${track.participant.identity}-${track.publication.trackSid}`}
            trackRef={track}
          />
        ) : null,
      )}
    </div>
  );
}
