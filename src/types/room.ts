export const ROOM_STATUSES = ["active", "ended", "expired"] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

export type ParticipantRole = "host" | "guest";

export type RoomRecord = {
  id: string;
  public_code: string;
  livekit_room_name: string;
  host_token_hash: string;
  password_hash: string | null;
  status: RoomStatus;
  created_at: string;
  expires_at: string;
  ended_at: string | null;
};

export type RoomEventType =
  | "created"
  | "joined"
  | "left"
  | "kicked"
  | "share_started"
  | "share_stopped"
  | "ended"
  | "expired"
  | "cleanup_marked";

export type RoomEventRecord = {
  id: string;
  room_id: string;
  event_type: RoomEventType;
  participant_identity: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type PublicRoomView = {
  publicCode: string;
  status: RoomStatus;
  hasPassword: boolean;
  expiresAt: string;
  participantLimit: number;
};

export type QualityPresetId =
  | "auto"
  | "720p30"
  | "720p60"
  | "1080p30"
  | "1080p60";

export type QualityPreset = {
  id: QualityPresetId;
  label: string;
  width?: number;
  height?: number;
  frameRate?: number;
};
