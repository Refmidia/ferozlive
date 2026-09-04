"use client";

import Image from "next/image";
import { useState } from "react";

export type RoomReactionId = "hammer" | "thumbs" | "heart";

export type RoomReaction = {
  id: RoomReactionId;
  label: string;
  src: string;
  emoji: string;
};

export const ROOM_REACTIONS: readonly RoomReaction[] = [
  {
    id: "hammer",
    label: "Martelo",
    src: "/reactions/hammer.png",
    emoji: "🔨",
  },
  {
    id: "thumbs",
    label: "Joia",
    src: "/reactions/thumbs-up.png",
    emoji: "👍",
  },
  {
    id: "heart",
    label: "Coração",
    src: "/reactions/heart.png",
    emoji: "❤️",
  },
] as const;

export const ROOM_REACTION_IDS = ROOM_REACTIONS.map((reaction) => reaction.id);

export type FloatingReaction = {
  id: string;
  reactionId: RoomReactionId;
  left: number;
};

export function getReaction(id: string): RoomReaction | undefined {
  return ROOM_REACTIONS.find((reaction) => reaction.id === id);
}

export function FloatingReactions({ reactions }: { reactions: FloatingReaction[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {reactions.map((reaction) => {
        const config = getReaction(reaction.reactionId);
        if (!config) return null;
        return (
          <span
            key={reaction.id}
            className="reaction-float absolute bottom-10 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
            style={{ left: `${reaction.left}%` }}
          >
            <Image
              src={config.src}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
              unoptimized
            />
          </span>
        );
      })}
    </div>
  );
}

export function useReactionBurst() {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  function burst(reactionId: RoomReactionId) {
    if (!getReaction(reactionId)) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const left = 18 + Math.random() * 64;
    setReactions((current) => [...current.slice(-18), { id, reactionId, left }]);
    window.setTimeout(() => {
      setReactions((current) => current.filter((reaction) => reaction.id !== id));
    }, 2800);
  }

  return { reactions, burst };
}
