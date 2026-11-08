import { getAuthToken } from "@/lib/auth-storage";
import type { ApiError, ApiResponse, PageMeta } from "@/types";

/**
 * نقطة الاتصال الوحيدة بالباك إند.
 * لا يُستعمل fetch مباشرة في المكونات أو الصفحات — الخدمات وحدها من تستدعي هذا الملف.
 * العقد: Base URL = /api/v1، JWT في ترويسة Authorization، أخطاء بصيغة { success:false, error }.
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "/api/v1").replace(/\/+$/, "");

/** خطأ موحّد يحمل رمز الخطأ من الخادم لعرضه في الواجهة */
export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: unknown[];

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.status = status;
    this.details = error.details ?? [];
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; meta?: PageMeta }> {
  const { method = "GET", body, query, signal } = options;
  const token = getAuthToken();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!payload) {
    throw new ApiRequestError(
      { code: "BAD_REQUEST", message: "تعذّر الاتصال بالخادم، حاول مجدداً." },
      response.status,
    );
  }
  if (!payload.success) {
    throw new ApiRequestError(payload.error, response.status);
  }
  return { data: payload.data, meta: payload.meta };
}

export const api = {
  get: <T>(path: string, query?: QueryParams, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", query, signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "POST", body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "PATCH", body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: "DELETE", signal }),
};
