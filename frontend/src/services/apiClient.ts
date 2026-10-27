const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function getAssetUrl(path: string) {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export class ApiError extends Error {
  status: number;
  errors?: string[];
  fields?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    errors?: string[],
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.fields = fields;
  }
}

// For authenticated files that cannot be used as a plain image or video URL
export async function apiFetchBlob(path: string, token: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  if (!response.ok) {
    throw new ApiError("Unable to load the file.", response.status);
  }

  return response.blob();
}

type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

type ErrorPayload = {
  message?: string;
  errors?: string[];
  fields?: Record<string, string>;
};

export async function apiFetch<TResponse>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorPayload = (data ?? {}) as ErrorPayload;
    throw new ApiError(
      errorPayload.message ?? "Something went wrong. Please try again.",
      response.status,
      errorPayload.errors,
      errorPayload.fields,
    );
  }

  return data as TResponse;
}
