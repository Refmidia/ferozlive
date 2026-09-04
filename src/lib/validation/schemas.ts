import { z } from "zod";
import { limits } from "@/config/limits";
import { normalizeRoomCode } from "@/lib/validation/room-code";
import { sanitizeDisplayName, sanitizeOptionalPassword } from "@/lib/validation/sanitize";

export const displayNameSchema = z
  .string()
  .transform(sanitizeDisplayName)
  .pipe(
    z
      .string()
      .min(limits.displayNameMin, "Informe um nome com pelo menos 2 caracteres.")
      .max(limits.displayNameMax, "O nome é longo demais."),
  );

export const roomCodeSchema = z
  .string()
  .min(1, "Informe o código da sala.")
  .transform(normalizeRoomCode)
  .refine((code) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code), {
    message: "Use um código no formato XXXX-XXXX.",
  });

export const passwordSchema = z
  .string()
  .transform(sanitizeOptionalPassword)
  .pipe(
    z
      .string()
      .min(limits.passwordMin, "A senha precisa ter pelo menos 4 caracteres.")
      .max(limits.passwordMax, "A senha é longa demais.")
      .optional(),
  );

export const optionalPasswordSchema = z
  .string()
  .optional()
  .transform((value) => (value ? sanitizeOptionalPassword(value) : undefined));

export const createRoomSchema = z.object({
  displayName: displayNameSchema,
  password: optionalPasswordSchema.refine(
    (value) => value === undefined || value.length >= limits.passwordMin,
    { message: "A senha precisa ter pelo menos 4 caracteres." },
  ),
});

export const joinRoomSchema = z.object({
  code: roomCodeSchema,
  displayName: displayNameSchema,
  password: z.string().max(limits.passwordMax).optional(),
});

export const tokenRequestSchema = z.object({
  code: roomCodeSchema,
  displayName: displayNameSchema,
  password: z.string().max(limits.passwordMax).optional(),
});

export const kickParticipantSchema = z.object({
  identity: z
    .string()
    .min(4, "Participante inválido.")
    .max(80, "Participante inválido.")
    .regex(/^spu_[a-f0-9]+$|^host_[a-f0-9]+$/, "Participante inválido."),
});

export const stopShareSchema = z.object({
  identity: z
    .string()
    .min(4)
    .max(80)
    .regex(/^spu_[a-f0-9]+$|^host_[a-f0-9]+$/),
  trackSid: z.string().min(4).max(120).optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type TokenRequestInput = z.infer<typeof tokenRequestSchema>;
