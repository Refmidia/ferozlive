import { unauthorized } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { hostFromRequest, kickParticipantFromRoom, loadJoinableRoom } from "@/lib/rooms/service";
import { kickParticipantSchema, roomCodeSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    await enforceRateLimit(request, "admin");
    const { code } = await context.params;
    const publicCode = roomCodeSchema.parse(code);
    const body = kickParticipantSchema.parse(await readJson(request));
    const admin = createSupabaseAdmin();
    const room = await loadJoinableRoom(admin, publicCode);

    if (!hostFromRequest(request, room)) {
      throw unauthorized();
    }

    await kickParticipantFromRoom(admin, room, body.identity);
    return jsonOk({ kicked: true });
  } catch (error) {
    return jsonError(error);
  }
}
