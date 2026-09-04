import { requireAdmin } from "@/lib/admin/auth";
import { jsonError, jsonOk } from "@/lib/http/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  try {
    const session = requireAdmin(request);
    return jsonOk({ username: session.u });
  } catch (error) {
    return jsonError(error);
  }
}
