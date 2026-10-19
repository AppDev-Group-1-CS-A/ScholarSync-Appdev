import { Request, Response } from "express";
import mongoose from "mongoose";
import { del } from "@vercel/blob";
import Book from "../models/book.model";
import BookSegment from "../models/book-segment.model";
import VoiceSession from "../models/voice-session.model";
import User from "../models/user.model";
import { escapeRegex, generateSlug, serializeData } from "../utils";
import { CreateBook, TextSegment } from "../types";

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const { search, userId } = req.query as { search?: string; userId?: string };

    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    let query: any = {};

    const user = await User.findOne({ clerkId: userId }).select("_id").lean();
    const ownerIds = [userId];
    if (user?._id) ownerIds.push(String(user._id));

    query.$or = [
      ...ownerIds.map((ownerId) => ({ userId: ownerId })),
      ...ownerIds.map((ownerId) => ({ clerkId: ownerId })),
    ];

    if (search) {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");
      query = {
        $and: [
          { $or: query.$or },
          { $or: [{ title: { $regex: regex } }, { author: { $regex: regex } }] },
        ],
      };
    }

    const books = await Book.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: serializeData(books),
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const checkBookExists = async (req: Request, res: Response) => {
  try {
    const title = String(req.params.title);
    if (!title || title === "undefined") {
      return res.status(400).json({ exists: false, error: "Title parameter is required" });
    }

    const slug = generateSlug(title);
    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return res.json({
        exists: true,
        book: serializeData(existingBook),
      });
    }

    return res.json({ exists: false });
  } catch (error) {
    console.error("Error checking book exists:", error);
    return res.status(500).json({
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getBookBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const book = await Book.findOne({ slug }).lean();

    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    return res.json({ success: true, data: serializeData(book) });
  } catch (error) {
    console.error(`[getBookBySlug] Error:`, error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const data: CreateBook = req.body;
    const userId = (req.headers["x-user-id"] as string) || data.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: Missing userId" });
    }

    const slug = generateSlug(data.title);
    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return res.json({
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      });
    }

    const book = await Book.create({
      ...data,
      userId,
      slug,
      totalSegments: 0,
    });

    return res.status(201).json({
      success: true,
      data: serializeData(book),
    });
  } catch (error) {
    console.error("Error creating book:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = (req.headers["x-user-id"] as string) || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    const bookUserId = book.userId || (book as any).clerkId;
    if (bookUserId && bookUserId !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Attempt to delete blob files if token is configured
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blobKeysToDelete = [book.fileBlobKey];
        if (book.coverBlobKey) blobKeysToDelete.push(book.coverBlobKey);
        await del(blobKeysToDelete);
      }
    } catch (blobErr) {
      console.warn("Could not delete blobs from storage:", blobErr);
    }

    await BookSegment.deleteMany({ bookId: book._id });
    await VoiceSession.deleteMany({ bookId: book._id });
    await Book.findByIdAndDelete(id);

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const saveBookSegments = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { segments, userId } = req.body as { segments: TextSegment[]; userId: string };

    if (!segments || !Array.isArray(segments)) {
      return res.status(400).json({ success: false, error: "Segments array is required" });
    }

    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        userId,
        bookId: id,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );

    await BookSegment.insertMany(segmentsToInsert);
    await Book.findByIdAndUpdate(id, { totalSegments: segments.length });

    return res.json({
      success: true,
      data: { segmentsCreated: segments.length },
    });
  } catch (error) {
    console.error("Error saving segments:", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};

export const searchSegments = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const query = (req.query.q as string) || "";
    const limit = parseInt((req.query.limit as string) || "5", 10);

    const bookObjectId = new mongoose.Types.ObjectId(id);
    let segments: any[] = [];

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

    if (segments.length === 0 && query.trim()) {
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

    return res.json({ success: true, data: serializeData(segments) });
  } catch (error) {
    console.error("Error searching segments:", error);
    return res.status(500).json({ success: false, error: String(error), data: [] });
  }
};
