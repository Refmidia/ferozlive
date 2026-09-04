import type { ParticipantRole, PublicRoomView } from "@/types/room";

export type ApiErrorBody = {
  ok: false;
  error: string;
  code: string;
};

export type ApiSuccess<T> = {
  ok: true;
} & T;

export type CreateRoomResponse = {
  publicCode: string;
  inviteUrl: string;
  isHost: true;
  expiresAt: string;
};

export type JoinRoomResponse = {
  room: PublicRoomView;
  isHost: boolean;
  requiresPassword: boolean;
};

export type RoomLookupResponse = {
  room: PublicRoomView;
};

export type TokenResponse = {
  token: string;
  livekitUrl: string;
  identity: string;
  role: ParticipantRole;
  room: PublicRoomView;
};

export type HealthResponse = {
  ok: true;
  services: {
    livekit: boolean;
    supabase: boolean;
  };
};
