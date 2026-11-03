import { Request, Response } from "express";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import Book from "../models/book.model";
import BookSegment from "../models/book-segment.model";
import ChatMessage from "../models/chat-message.model";
import { escapeRegex } from "../utils";
import { Messages } from "../types";

type ChatOwnerResult =
  | { userId: string }
  | { error: string; status: 400 | 401 | 403 | 404 };

async function getChatOwner(req: Request, bookId: string): Promise<ChatOwnerResult> {
  const book = await Book.findById(bookId).select("userId clerkId");
  if (!book) return { error: "Book not found", status: 404 as const };

  const requestedUserId =
    (req.headers["x-user-id"] as string) ||
    (typeof req.body?.userId === "string" ? req.body.userId : undefined);
  if (!requestedUserId) {
    return { error: "Unauthorized: Missing userId", status: 401 as const };
  }

  const bookUserIds = [book.userId, book.clerkId].filter(Boolean) as string[];

  if (requestedUserId && !bookUserIds.includes(requestedUserId)) {
    return { error: "Unauthorized", status: 403 as const };
  }

  const userId = book.userId || book.clerkId;
  if (!userId) return { error: "Book owner not found", status: 400 as const };

  return { userId };
}

const getGroq = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing in backend .env");
  return new Groq({ apiKey });
};

async function findBookSegments(bookId: string, query: string, limit: number = 6) {
  try {
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
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

    return segments;
  } catch (error) {
    console.error("Error retrieving segments for chat:", error);
    return [];
  }
}

export const chatWithBook = async (req: Request, res: Response) => {
  try {
    const { bookId, bookTitle, userMessage, history = [] } = req.body as {
      bookId: string;
      bookTitle: string;
      userMessage: string;
      history?: Messages[];
    };

    if (!bookId || !userMessage) {
      return res.status(400).json({
        success: false,
        error: "Missing bookId or userMessage",
      });
    }

    if (typeof bookId !== "string" || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, error: "Invalid bookId" });
    }

    const owner = await getChatOwner(req, bookId);
    if ("error" in owner) {
      return res.status(owner.status).json({ success: false, error: owner.error });
    }

    const groq = getGroq();

    // 1. Search context from book segments
    const segments = await findBookSegments(bookId, userMessage, 6);
    const context =
      segments.length > 0
        ? segments
            .map((s: any) => `[Page ${s.pageNumber || "?"}] ${s.content}`)
            .join("\n\n")
        : "";

    // 2. Prepare system prompt
    const systemPrompt = `You are a world-class Academic Tutor specializing in the book: "${bookTitle}".

GOAL: 
Provide clear, structured, and visually organized explanations based on the book's content.

FORMATTING RULES (CRITICAL):
1. Use **bold text** for key terms and concepts.
2. Use ### Bulleted lists or numbered steps for complex explanations.
3. Use > Blockquotes if you are quoting directly from the text.
4. Keep paragraphs short and focused.
5. If you mention a specific detail, cite the page number in [brackets] if available in the context.

STRUCTURE:
- Start with a direct, one-sentence answer.
- Follow with a detailed breakdown using headers or lists.
- End with a "Pro-Tip" or a summary takeaway to help the student remember.

CONTEXT FROM THE BOOK:
${context || "No specific segments found for this query."}`;

    // 3. Build message history
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    // 4. Call Groq LLM
    const completion = await groq.chat.completions.create({
      messages: chatMessages as any,
      model: "openai/gpt-oss-120b",
      temperature: 0.5,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    await ChatMessage.insertMany([
      {
        userId: owner.userId,
        bookId: new mongoose.Types.ObjectId(bookId),
        role: "user",
        content: userMessage,
        citations: [],
      },
      {
        userId: owner.userId,
        bookId: new mongoose.Types.ObjectId(bookId),
        role: "assistant",
        content: responseText,
        citations: segments.map((segment: any) => ({
          pageNumber: segment.pageNumber,
          segmentIndex: segment.segmentIndex,
        })),
      },
    ]);

    return res.json({
      success: true,
      data: responseText,
    });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get response from Groq",
    });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const bookId = String(req.params.bookId);
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, error: "Invalid bookId" });
    }

    const owner = await getChatOwner(req, bookId);
    if ("error" in owner) {
      return res.status(owner.status).json({ success: false, error: owner.error });
    }

    const messages = await ChatMessage.find({ bookId, userId: owner.userId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(50)
      .lean();

    return res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    console.error("Chat history error:", error);
    return res.status(500).json({ success: false, error: "Failed to load chat history" });
  }
};

export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const bookId = String(req.params.bookId);
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, error: "Invalid bookId" });
    }

    const owner = await getChatOwner(req, bookId);
    if ("error" in owner) {
      return res.status(owner.status).json({ success: false, error: owner.error });
    }

    const result = await ChatMessage.deleteMany({ bookId, userId: owner.userId });
    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Clear chat history error:", error);
    return res.status(500).json({ success: false, error: "Failed to clear chat history" });
  }
};

export const summarizeBookSection = async (req: Request, res: Response) => {
  try {
    const { bookId, bookTitle = "this textbook" } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, error: "Missing bookId" });
    }

    if (typeof bookId !== "string" || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, error: "Invalid bookId" });
    }

    const groq = getGroq();
    const segments = await findBookSegments(bookId, "summary concepts key points", 5);

    const contextSegments =
      segments.length > 0
        ? segments
        : await BookSegment.find({ bookId: new mongoose.Types.ObjectId(bookId) })
            .select("content segmentIndex")
            .sort({ segmentIndex: 1 })
            .limit(5)
            .lean();

    if (contextSegments.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No book content found for this bookId",
      });
    }

    const context = contextSegments.map((segment) => segment.content).join("\n\n");

    const prompt = `You are an expert academic tutor for "${bookTitle}".
Analyze only the provided book context and return a concise, accurate study summary formatted with Markdown. Do not invent details that are not supported by the context.

### 📌 Executive Summary
(2-3 sentences explaining the core subject)

### 🔑 Key Takeaways
(3-5 concise bullet points)

### 📖 Important Terminology
(List important terms from the context with their definitions)

CONTEXT:
${context}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.4,
      max_tokens: 1000,
    });

    const summaryText = completion.choices[0]?.message?.content || "";

    return res.json({
      success: true,
      data: summaryText,
    });
  } catch (error) {
    console.error("Summary error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate summary" });
  }
};