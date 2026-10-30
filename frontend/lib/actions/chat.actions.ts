"use server";

import { Messages } from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

export const chatWithBook = async (
  bookId: string,
  userId: string,
  bookTitle: string,
  userMessage: string,
  history: Messages[] = []
) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({
        bookId,
        userId,
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

export const getChatHistory = async (bookId: string, userId: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat/history/${bookId}`, {
      headers: { "x-user-id": userId },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Backend error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Chat History Action Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load chat history",
    };
  }
};

export const clearChatHistory = async (bookId: string, userId: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat/history/${bookId}`, {
      method: "DELETE",
      headers: { "x-user-id": userId },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Backend error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Clear Chat History Action Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear chat history",
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

