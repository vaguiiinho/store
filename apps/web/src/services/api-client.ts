export type ApiResult<T> =
  | { ok: true; data: T; headers: Headers }
  | { ok: false; message: string; status: number; headers: Headers };

const apiBaseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function getMessage(body: unknown) {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: string | string[] }).message;
    return Array.isArray(message) ? message.join(", ") : message ?? "Nao foi possivel concluir a solicitacao.";
  }

  return "Nao foi possivel concluir a solicitacao.";
}

export const apiClient = {
  async request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        cache: "no-store",
        ...init
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        return { ok: false, message: getMessage(body), status: response.status, headers: response.headers };
      }

      return { ok: true, data: body as T, headers: response.headers };
    } catch {
      return { ok: false, message: "Servico indisponivel. Tente novamente.", status: 0, headers: new Headers() };
    }
  }
};
