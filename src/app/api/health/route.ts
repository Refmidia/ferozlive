import { getServiceStatus } from "@/config/env";
import { jsonOk } from "@/lib/http/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return jsonOk({
    services: getServiceStatus(),
  });
}
