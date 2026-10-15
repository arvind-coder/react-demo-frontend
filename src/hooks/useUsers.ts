import { useCallback, useEffect, useState } from "react";
import { ApiRequestError } from "../services/api";
import * as userService from "../services/userService";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types/user";

/**
 * CUSTOM HOOK: owns the list of users and every operation that changes it.
 * A custom hook is just a function (name starts with "use") that can call other hooks.
 * It keeps App.tsx focused on the UI while this file focuses on data.
 */
export function useUsers() {
  // useState returns [currentValue, setterFunction]. Calling a setter does NOT change the variable
  // immediately; it tells React "state changed, run the component again and redraw the screen".
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // true because we fetch right on mount
  const [error, setError] = useState<string | null>(null);

  /** GET /api/users, then store the result in state. */
  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers(signal);
      setUsers(response.data); // response = { success, message, data: User[] } -> we keep `data`
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return; // cancelled on purpose
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong while loading users.");
    } finally {
      // `finally` runs on success AND failure, so the spinner can never get stuck.
      // (When aborted we returned above, so a newer request keeps control of the spinner.)
      setIsLoading(false);
    }
  }, []);

  /**
   * useEffect runs code AFTER React has drawn the screen (a "side effect": talking to a server).
   * With an empty dependency array [] it runs once when the component first appears.
   * The returned function is a CLEANUP: React calls it when the component disappears (e.g. the user
   * navigates to another page before the response arrives) so we cancel the now-useless request.
   */
  useEffect(() => {
    const controller = new AbortController();
    void loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  /**
   * MUTATIONS: call the API first, and update local state ONLY after the server confirms success.
   * If the API call throws, the lines after `await` never run, so the UI never shows
   * something the database does not have. The error is re-thrown to the caller (a modal/form)
   * which decides how to show it.
   */
  const createUser = async (payload: CreateUserPayload): Promise<User> => {
    const response = await userService.createUser(payload);
    // Never mutate state (users.push) - create a NEW array so React notices the change.
    setUsers((current) => [response.data, ...current]);
    return response.data;
  };

  const updateUser = async (id: string, changes: UpdateUserPayload): Promise<User> => {
    const response = await userService.updateUser(id, changes);
    // Replace only the edited user, keep the rest.
    setUsers((current) => current.map((u) => (u._id === id ? response.data : u)));
    return response.data;
  };

  const deleteUser = async (id: string): Promise<void> => {
    await userService.deleteUser(id);
    setUsers((current) => current.filter((u) => u._id !== id));
  };

  return { users, isLoading, error, refresh: () => loadUsers(), createUser, updateUser, deleteUser };
}
