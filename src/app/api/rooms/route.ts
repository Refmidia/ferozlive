import { createHostCookie } from "@/lib/auth/host";
import { AppError } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { getRequestOrigin, jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createConfiguredRoom } from "@/lib/rooms/service";
import { createRoomSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await enforceRateLimit(request, "createRoom");
    const body = createRoomSchema.parse(await readJson(request));
    const admin = createSupabaseAdmin();
    const { room, hostSecret } = await createConfiguredRoom(admin, {
      password: body.password,
    });

    const inviteUrl = `${getRequestOrigin(request)}/room/${room.public_code}`;

    return jsonOk(
      {
        publicCode: room.public_code,
        inviteUrl,
        isHost: true as const,
        expiresAt: room.expires_at,
      },
      {
        headers: {
          "Set-Cookie": createHostCookie(room.public_code, hostSecret),
        },
      },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error);
    }
    return jsonError(error);
  }
}
