"use server";

import { CreateBook, TextSegment } from "@/types";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

export const getAllBooks = async (search?: string, userId?: string) => {
  try {
    const url = new URL(`${BACKEND_URL}/api/books`);
    if (userId) url.searchParams.append("userId", userId);
    if (search) url.searchParams.append("search", search);

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    return await res.json();
  } catch (e) {
    console.error("Error fetching books from backend:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
      data: [],
    };
  }
};

export const checkBookExists = async (title: string) => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/books/check/${encodeURIComponent(title)}`,
      { cache: "no-store" }
    );
    return await res.json();
  } catch (e) {
    console.error("Error checking book exists from backend:", e);
    return { exists: false, error: e instanceof Error ? e.message : String(e) };
  }
};

export const createBook = async (data: CreateBook) => {
  try {
    const session = await getSession();
    const userId = session?.userId || data.userId;

    if (!userId) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${BACKEND_URL}/api/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ ...data, userId }),
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (e) {
    console.error("Error creating book via backend:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};

export const deleteBook = async (bookId: string) => {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${BACKEND_URL}/api/books/${bookId}`, {
      method: "DELETE",
      headers: {
        "x-user-id": userId,
      },
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (e) {
    console.error("Error deleting book via backend:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/books/slug/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, error: "Book not found" };
    }

    return await res.json();
  } catch (e) {
    console.error(`[getBookBySlug] Error calling backend:`, e);
    return { success: false, error: String(e) };
  }
};

export const saveBookSegments = async (
  bookId: string,
  userId: string,
  segments: TextSegment[]
) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/books/${bookId}/segments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ segments, userId }),
    });

    return await res.json();
  } catch (e) {
    console.error("Error saving segments via backend:", e);
    return { success: false, error: String(e) };
  }
};

export const searchBookSegments = async (
  bookId: string,
  query: string,
  limit: number = 5
) => {
  try {
    const url = new URL(`${BACKEND_URL}/api/books/${bookId}/search`);
    url.searchParams.append("q", query);
    url.searchParams.append("limit", String(limit));

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    return await res.json();
  } catch (error) {
    console.error("Error searching segments via backend:", error);
    return { success: false, error: String(error), data: [] };
  }
};

export const seedDemoBook = async (targetUserId?: string) => {
  try {
    const session = await getSession();
    const userId = targetUserId || session?.userId;

    const res = await fetch(`${BACKEND_URL}/api/books/seed-demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userId ? { "x-user-id": userId } : {}),
      },
      body: JSON.stringify({ userId }),
      cache: "no-store",
    });

    const data = await res.json();
    revalidatePath("/");
    return data;
  } catch (e) {
    console.error("Error seeding demo book via backend:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};

