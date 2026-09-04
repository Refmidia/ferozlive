import { requireLiveKitEnv } from "@/config/env";
import { unauthorized } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { markTicketCitizen } from "@/lib/admin/tickets";
import { createSupabaseAdmin, insertRoomEvent } from "@/lib/supabase/admin";
import {
  ensureRoomCapacity,
  hostFromRequest,
  issueRoomToken,
  loadJoinableRoom,
  toPublicRoom,
  verifyRoomPassword,
} from "@/lib/rooms/service";
import { tokenRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await enforceRateLimit(request, "token");
    const livekit = requireLiveKitEnv();
    const body = tokenRequestSchema.parse(await readJson(request));
    const admin = createSupabaseAdmin();
    const room = await loadJoinableRoom(admin, body.code);
    const passwordState = await verifyRoomPassword(room, body.password);

    if (passwordState !== "ok") {
      throw unauthorized("Código ou senha inválidos.");
    }

    const isHost = hostFromRequest(request, room);
    if (!isHost) {
      await ensureRoomCapacity(room);
    }

    const issued = await issueRoomToken({
      room,
      displayName: body.displayName,
      isHost,
    });

    await insertRoomEvent(admin, {
      room_id: room.id,
      event_type: "joined",
      participant_identity: issued.identity,
      metadata: { role: issued.role },
    });

    if (issued.role === "guest") {
      await markTicketCitizen(admin, room.public_code, body.displayName);
    }

    return jsonOk({
      token: issued.token,
      livekitUrl: livekit.url,
      identity: issued.identity,
      role: issued.role,
      room: toPublicRoom(room),
    });
  } catch (error) {
    return jsonError(error);
  }
}
