import { roomCodeSchema } from "@/lib/validation/schemas";
import { jsonError, jsonOk } from "@/lib/http/responses";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { findRoomByCode } from "@/lib/supabase/admin";
import { notFound } from "@/lib/http/errors";
import { toPublicRoom } from "@/lib/rooms/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;
    const publicCode = roomCodeSchema.parse(code);
    const room = await findRoomByCode(createSupabaseAdmin(), publicCode);

    if (!room) {
      throw notFound();
    }

    return jsonOk({ room: toPublicRoom(room) });
  } catch (error) {
    return jsonError(error);
  }
}
