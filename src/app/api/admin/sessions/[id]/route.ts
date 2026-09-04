import { requireAdmin } from "@/lib/admin/auth";
import { updateTicket } from "@/lib/admin/tickets";
import { jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updateTicketSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    requireAdmin(request);
    const { id } = await context.params;
    const body = updateTicketSchema.parse(await readJson(request));
    const ticket = await updateTicket(createSupabaseAdmin(), id, {
      ...body,
      resolved_at: body.status === "resolved" ? new Date().toISOString() : undefined,
    });
    return jsonOk({ ticket });
  } catch (error) {
    return jsonError(error);
  }
}
