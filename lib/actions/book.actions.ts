"use server";

import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import { escapeRegex, generateSlug, serializeData } from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import VoiceSession from "@/database/models/voice-session.model";
import User from "@/database/models/user.model";
import mongoose from "mongoose";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export const getAllBooks = async (search?: string, userId?: string) => {
  try {
    await connectToDatabase();

    let query: any = {};

    if (userId) {
      // Support books saved with either the Clerk ID or the Mongo user ID.
      const user = await User.findOne({ clerkId: userId }).select("_id").lean();
      const ownerIds = [userId];

      if (user?._id) ownerIds.push(String(user._id));

      query.$or = [
        ...ownerIds.map((ownerId) => ({ userId: ownerId })),
        ...ownerIds.map((ownerId) => ({ clerkId: ownerId })),
      ];
    } else {
      return { success: true, data: [] };
    }

    if (search) {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");
      const searchFilter = {
        $or: [{ title: { $regex: regex } }, { author: { $regex: regex } }],
      };

      query = {
        $and: [{ $or: query.$or }, searchFilter],
      };
    }

    const books = await Book.find(query).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books),
    };
  } catch (e) {
    console.error("Error fetching books:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();
    const slug = generateSlug(title);
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook),
      };
    }
    return { exists: false };
  } catch (e) {
    console.error("Error checking book exists", e);
    return { exists: false, error: e instanceof Error ? e.message : String(e) };
  }
};

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();
    const slug = generateSlug(data.title);
    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      };
    }

    const session = await getSession();
    const userId = session?.userId;

    if (!userId) return { success: false, error: "Unauthorized" };

    const book = await Book.create({
      ...data,
      userId,
      slug,
      totalSegments: 0,
    });

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (e) {
    console.error("Error creating a book", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};

export const deleteBook = async (bookId: string) => {
  try {
    await connectToDatabase();
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) return { success: false, error: "Unauthorized" };

    const book = await Book.findById(bookId);
    if (!book) return { success: false, error: "Book not found" };

    const bookUserId = book.userId || (book as any).clerkId;
    if (bookUserId && bookUserId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const blobKeysToDelete = [book.fileBlobKey];
    if (book.coverBlobKey) blobKeysToDelete.push(book.coverBlobKey);
    await del(blobKeysToDelete);

    await BookSegment.deleteMany({ bookId: book._id });
    await VoiceSession.deleteMany({ bookId: book._id });
    await Book.findByIdAndDelete(bookId);

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error deleting book", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase();
    const book = await Book.findOne({ slug }).lean();
    if (!book) return { success: false, error: "Book not found" };
    return { success: true, data: serializeData(book) };
  } catch (e) {
    console.error(`[getBookBySlug] Error:`, e);
    return { success: false, error: String(e) };
  }
};

export const saveBookSegments = async (
  bookId: string,
  userId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();
    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        userId,
        bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );
    await BookSegment.insertMany(segmentsToInsert);
    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });
    return { success: true, data: { segmentsCreated: segments.length } };
  } catch (e) {
    console.error("Error saving segments", e);
    return { success: false, error: String(e) };
  }
};

export const searchBookSegments = async (
  bookId: string,
  query: string,
  limit: number = 5,
) => {
  try {
    await connectToDatabase();
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    let segments = [];
    try {
      segments = await BookSegment.find({
        bookId: bookObjectId,
        $text: { $search: query },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();
    } catch {
      segments = [];
    }

    if (segments.length === 0) {
      const keywords = query.split(/\s+/).filter((k) => k.length > 2);
      const pattern = keywords.map(escapeRegex).join("|");
      segments = await BookSegment.find({
        bookId: bookObjectId,
        content: { $regex: pattern, $options: "i" },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ segmentIndex: 1 })
        .limit(limit)
        .lean();
    }

    return { success: true, data: serializeData(segments) };
  } catch (error) {
    return { success: false, error: String(error), data: [] };
  }
};
