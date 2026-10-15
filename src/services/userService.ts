import type { ApiSuccess } from "../types/api";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types/user";
import { request } from "./api";

/**
 * USER API METHODS - one function per backend endpoint.
 * Each returns a Promise (async work). Callers `await` it and handle errors with try/catch.
 */

/** GET /api/users - no body, no params. Returns every user. */
export const getUsers = (signal?: AbortSignal): Promise<ApiSuccess<User[]>> =>
  request<User[]>("/users", { method: "GET", signal });

/** GET /api/users/:id - the id is a PATH PARAMETER inserted into the URL. */
export const getUserById = (id: string, signal?: AbortSignal): Promise<ApiSuccess<User>> =>
  // encodeURIComponent keeps odd characters from breaking the URL.
  request<User>(`/users/${encodeURIComponent(id)}`, { method: "GET", signal });

/**
 * POST /api/users - creates a user.
 * JSON.stringify turns the JS object into the JSON text sent as the request body:
 *   {"name":"Rahul Sharma","email":"rahul@example.com","phone":"9876543210","department":"Engineering"}
 */
export const createUser = (payload: CreateUserPayload): Promise<ApiSuccess<User>> =>
  request<User>("/users", { method: "POST", body: JSON.stringify(payload) });

/**
 * PATCH /api/users/:id - partial update: send ONLY the fields that changed.
 *
 * PATCH vs PUT:
 *  - PUT   replaces the WHOLE resource; fields you omit are removed/reset.
 *  - PATCH changes ONLY the fields you send; everything else stays as it was.
 * For "edit a user's phone number" PATCH is the better fit.
 */
export const updateUser = (id: string, changes: UpdateUserPayload): Promise<ApiSuccess<User>> =>
  request<User>(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) });

/** DELETE /api/users/:id - no body. The backend returns the deleted user in `data`. */
export const deleteUser = (id: string): Promise<ApiSuccess<User>> =>
  request<User>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
