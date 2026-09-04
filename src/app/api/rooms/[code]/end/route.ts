import { unauthorized } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { jsonError, jsonOk } from "@/lib/http/responses";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { endRoomForEveryone, hostFromRequest, loadJoinableRoom } from "@/lib/rooms/service";
import { roomCodeSchema } from "@/lib/validation/schemas";

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
    const admin = createSupabaseAdmin();
    const room = await loadJoinableRoom(admin, publicCode);

    if (!hostFromRequest(request, room)) {
      throw unauthorized();
    }

    await endRoomForEveryone(admin, room);
    return jsonOk({ ended: true });
  } catch (error) {
    return jsonError(error);
  }
}
