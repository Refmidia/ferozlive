import { adminCookie, createAdminSession, verifyAdminCredentials } from "@/lib/admin/auth";
import { unauthorized } from "@/lib/http/errors";
import { enforceRateLimit } from "@/lib/http/rate-limit-guard";
import { jsonError, jsonOk, readJson } from "@/lib/http/responses";
import { adminLoginSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await enforceRateLimit(request, "adminLogin");
    const body = adminLoginSchema.parse(await readJson(request));

    if (!verifyAdminCredentials(body.username, body.password)) {
      throw unauthorized("Usuário ou senha inválidos.");
    }

    return jsonOk(
      { username: body.username },
      { headers: { "Set-Cookie": adminCookie(createAdminSession(body.username)) } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
