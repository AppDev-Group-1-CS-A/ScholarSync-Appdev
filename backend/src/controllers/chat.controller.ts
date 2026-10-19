import { Request, Response } from "express";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import BookSegment from "../models/book-segment.model";
import { escapeRegex } from "../utils";
import { Messages } from "../types";

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
