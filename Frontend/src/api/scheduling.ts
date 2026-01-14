// src/api/scheduling.ts
import { apiPost } from "./client";

/**
 * Triggers the maintenance scheduler on the backend.
 * Uses POST as seen in your previous code.
 */
export async function runScheduler(): Promise<any> {
  return apiPost("/schedule");
}