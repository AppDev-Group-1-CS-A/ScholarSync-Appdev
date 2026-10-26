"use server";

import { Messages } from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

export const chatWithBook = async (
  bookId: string,
  bookTitle: string,
  userMessage: string,
  history: Messages[] = []
) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId,
        bookTitle,
        userMessage,
        history,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Backend error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Chat Action Error (calling backend):", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to backend AI service",
    };
  }
};

export const getBookSummary = async (bookId: string, bookTitle: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId,
        bookTitle,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Backend error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Summary Action Error (calling backend):", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate summary from AI",
    };
  }
};

