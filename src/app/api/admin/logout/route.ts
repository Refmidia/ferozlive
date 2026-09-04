import { clearAdminCookie } from "@/lib/admin/auth";
import { jsonOk } from "@/lib/http/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST() {
  return jsonOk({ ended: true }, { headers: { "Set-Cookie": clearAdminCookie() } });
}
