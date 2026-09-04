export class ClientApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as
    | ({ ok: true } & T)
    | { ok: false; error?: string; code?: string }
    | null;

  if (!response.ok || !data || data.ok !== true) {
    throw new ClientApiError(
      data && "error" in data && data.error
        ? data.error
        : "Não foi possível concluir esta ação agora.",
      data && "code" in data && data.code ? data.code : "REQUEST_FAILED",
      response.status,
    );
  }

  return data;
}
