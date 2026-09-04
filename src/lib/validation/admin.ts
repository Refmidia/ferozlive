import { z } from "zod";
import { limits } from "@/config/limits";
import { displayNameSchema, optionalPasswordSchema } from "@/lib/validation/schemas";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(2).max(32),
  password: z.string().min(4).max(64),
});

export const createTicketSchema = z.object({
  category: z.enum(["ocorrencia", "instalacao", "anticheat", "outro"]),
  citizenName: z
    .string()
    .max(limits.displayNameMax)
    .optional()
    .transform((value) => value?.trim() || undefined),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((value) => value?.trim() || undefined),
  password: optionalPasswordSchema,
  staffName: displayNameSchema.optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  notes: z.string().max(500).optional(),
  citizenName: z.string().max(limits.displayNameMax).optional(),
});
