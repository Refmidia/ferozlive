import { getServerEnv } from "@/config/env";
import { unauthorized } from "@/lib/http/errors";
import { jsonError, jsonOk } from "@/lib/http/responses";
import { createSupabaseAdmin, expireActiveRooms } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
      throw unauthorized("Não autorizado.");
    }

    const admin = createSupabaseAdmin();
    const nowIso = new Date().toISOString();
    const expired = await expireActiveRooms(admin, nowIso);

    return jsonOk({
      expired,
      retained: true,
      note: "Registros expirados foram apenas marcados. A exclusão física deve ocorrer após o período de retenção.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
