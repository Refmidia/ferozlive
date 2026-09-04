import { createHostCookie } from "@/lib/auth/host";
import { requireAdmin } from "@/lib/admin/auth";
import { insertTicket, listTickets, ticketStats } from "@/lib/admin/tickets";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { getRequestOrigin, jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { createConfiguredRoom } from "@/lib/rooms/service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createTicketSchema } from "@/lib/validation/admin";
import type { SupportCategoryId } from "@/config/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireAdmin(request);
    const tickets = await listTickets(createSupabaseAdmin());
    return jsonOk({ tickets, stats: ticketStats(tickets) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = requireAdmin(request);
    await enforceRateLimit(request, "createRoom");
    const body = createTicketSchema.parse(await readJson(request));
    const supabase = createSupabaseAdmin();
    const created = await createConfiguredRoom(supabase, { password: body.password });

    const ticket = await insertTicket(supabase, {
      room_id: created.room.id,
      public_code: created.room.public_code,
      category: body.category as SupportCategoryId,
      citizen_name: body.citizenName ?? null,
      staff_name: body.staffName ?? admin.u,
      status: "open",
      notes: body.notes ?? null,
    });

    const headers = new Headers();
    headers.append("Set-Cookie", createHostCookie(created.room.public_code, created.hostSecret));

    return jsonOk(
      {
        ticket,
        publicCode: created.room.public_code,
        inviteUrl: `${getRequestOrigin(request)}/room/${created.room.public_code}`,
        expiresAt: created.room.expires_at,
      },
      { headers },
    );
  } catch (error) {
    return jsonError(error);
  }
}
