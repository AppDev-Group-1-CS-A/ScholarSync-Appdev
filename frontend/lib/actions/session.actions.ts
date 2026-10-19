"use server";

import { StartSessionResult, EndSessionResult } from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

export const startVoiceSession = async (
  userId: string,
  bookId: string
): Promise<StartSessionResult> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bookId }),
    });

    return await res.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error starting voice session via backend:", error);
    return {
      success: false,
      error: `Failed to start voice session: ${errorMessage}`,
    };
  }
};

export const endVoiceSession = async (
  sessionId: string,
  durationSeconds: number
): Promise<EndSessionResult> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/session/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, durationSeconds }),
    });

    return await res.json();
  } catch (e) {
    console.error("Error ending voice session via backend:", e);
    return {
      success: false,
      error: "Failed to end voice session. Please try again later.",
    };
  }
};
