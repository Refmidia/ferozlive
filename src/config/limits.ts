export const limits = {
  maxParticipantsPerRoom: 5,
  roomTtlHours: 2,
  roomRetentionDays: 7,
  displayNameMin: 2,
  displayNameMax: 32,
  passwordMin: 4,
  passwordMax: 64,
  publicCodeLength: 8,
  tokenTtlHours: 2,
  rateLimit: {
    createRoom: { max: 5, windowMs: 15 * 60 * 1000 },
    joinRoom: { max: 20, windowMs: 5 * 60 * 1000 },
    token: { max: 30, windowMs: 5 * 60 * 1000 },
    admin: { max: 20, windowMs: 5 * 60 * 1000 },
    adminLogin: { max: 8, windowMs: 15 * 60 * 1000 },
  },
} as const;

export const ROOM_TTL_MS = limits.roomTtlHours * 60 * 60 * 1000;
export const ROOM_RETENTION_MS = limits.roomRetentionDays * 24 * 60 * 60 * 1000;
export const TOKEN_TTL = `${limits.tokenTtlHours}h`;

export const HOST_COOKIE_PREFIX = "sp_host_";
export const DISPLAY_NAME_STORAGE_KEY = "screenparty.displayName";
