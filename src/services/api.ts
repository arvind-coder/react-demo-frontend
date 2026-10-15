import type { ApiFailure, ApiResponse, ApiSuccess } from "../types/api";

/**
 * API SERVICE LAYER (generic HTTP helper)
 * All network code lives here and in userService.ts, so components never call fetch() directly
 * and the backend URL is configured in exactly one place.
 */

// The base URL comes from frontend/.env (VITE_API_BASE_URL). Never hardcode it in components.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * One error type for everything that can go wrong, so UI code has a single thing to catch.
 *  - isNetworkError = true : the request never got an answer (server down, wrong URL, CORS block).
 *  - isNetworkError = false: the server answered, but with 4xx/5xx (status tells which one).
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number | null, // null when there was no HTTP response at all
    public readonly isNetworkError: boolean,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/**
 * Sends one HTTP request and returns the parsed success body.
 *
 * @param path    e.g. "/users" or `/users/${id}` - appended to the base URL.
 *                A dynamic route parameter is just string interpolation:
 *                request(`/users/${id}`) with id "665f..." calls GET http://localhost:5000/api/users/665f...
 * @param options method, body, headers, abort signal (standard fetch options)
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<ApiSuccess<T>> {
  let response: Response;

  // STEP 1 - send the request.
  // fetch() REJECTS only when no HTTP response was received at all (a NETWORK error:
  // server not running, DNS failure, CORS blocked, offline). It does NOT reject on 404/500!
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        // Tells Express (express.json()) that the body is JSON. Without it req.body would be empty.
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    // An aborted request (component unmounted) is intentional, not a failure: let the caller ignore it.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiRequestError(
      "Cannot reach the server. Check that the backend is running and VITE_API_BASE_URL is correct.",
      null,
      true
    );
  }

  // STEP 2 - parse the JSON body. We parse before checking status because our backend sends
  // useful JSON ({ success:false, message }) even for errors. The body can be non-JSON
  // (e.g. a proxy's HTML error page), so we guard against a parse failure.
  let body: ApiResponse<T> | null = null;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    body = null;
  }

  // STEP 3 - HTTP errors. response.ok is true only for status 200-299.
  // This is an HTTP error: the server WAS reached and answered "no".
  if (!response.ok || body === null || body.success === false) {
    const failure = body as ApiFailure | null;
    throw new ApiRequestError(
      failure?.message ?? `Request failed with status ${response.status}`,
      response.status,
      false,
      failure?.errors
    );
  }

  return body; // typed as ApiSuccess<T>: { success: true, message, data }
}
