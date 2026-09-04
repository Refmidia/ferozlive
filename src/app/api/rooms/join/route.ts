import { unauthorized } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  hostFromRequest,
  loadJoinableRoom,
  toPublicRoom,
  verifyRoomPassword,
} from "@/lib/rooms/service";
import { joinRoomSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await enforceRateLimit(request, "joinRoom");
    const body = joinRoomSchema.parse(await readJson(request));
    const room = await loadJoinableRoom(createSupabaseAdmin(), body.code);
    const passwordState = await verifyRoomPassword(room, body.password);

    if (passwordState === "required") {
      return jsonOk({
        room: toPublicRoom(room),
        isHost: hostFromRequest(request, room),
        requiresPassword: true,
      });
    }

    if (passwordState === "invalid") {
      throw unauthorized("Código ou senha inválidos.");
    }

    return jsonOk({
      room: toPublicRoom(room),
      isHost: hostFromRequest(request, room),
      requiresPassword: false,
    });
  } catch (error) {
    return jsonError(error);
  }
}
