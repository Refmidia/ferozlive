export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return new AppError(message, 400, code);
}

export function unauthorized(message = "Você não tem permissão para esta ação.") {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Acesso negado.") {
  return new AppError(message, 403, "FORBIDDEN");
}

export function notFound(message = "Sala não encontrada ou indisponível.") {
  return new AppError(message, 404, "NOT_FOUND");
}

export function conflict(message: string, code = "CONFLICT") {
  return new AppError(message, 409, code);
}

export function tooManyRequests(resetAt: number) {
  const error = new AppError(
    "Muitas tentativas. Aguarde um momento e tente novamente.",
    429,
    "RATE_LIMITED",
  );
  (error as AppError & { resetAt: number }).resetAt = resetAt;
  return error;
}

export function serviceUnavailable(message: string) {
  return new AppError(message, 503, "SERVICE_UNAVAILABLE");
}
