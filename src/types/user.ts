/**
 * A user exactly as the backend returns it (see backend/src/models/User.ts).
 * JSON has no Date type, so dates arrive as ISO strings like "2026-10-14T05:49:05.804Z".
 */
export interface User {
  _id: string; // MongoDB ObjectId serialized as a string. We use it as the React list key.
  name: string;
  email: string;
  phone: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

/** The fields a human fills in the form. Also the request body of POST /api/users. */
export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  department: string;
}

/** PATCH accepts any subset of the fields (Partial = every property optional). */
export type UpdateUserPayload = Partial<CreateUserPayload>;

/** Per-field error messages, e.g. { email: "Email is required" }. */
export type FieldErrors = Partial<Record<keyof CreateUserPayload, string>>;

export const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Support"] as const;
