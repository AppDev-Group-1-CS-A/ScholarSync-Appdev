import { Request, Response } from "express";
import mongoose from "mongoose";
import BookSegment from "../models/book-segment.model";
import { escapeRegex } from "../utils";

async function processBookSearch(bookId: unknown, query: unknown) {
  if (bookId == null || query == null || query === "") {
    return { result: "Missing bookId or query" };
  }

  const bookIdStr = String(bookId);
  const queryStr = String(query).trim();

  if (!bookIdStr || bookIdStr === "null" || bookIdStr === "undefined" || !queryStr) {
    return { result: "Missing bookId or query" };
  }

  try {
    const bookObjectId = new mongoose.Types.ObjectId(bookIdStr);
    let segments: any[] = [];

    try {
      segments = await BookSegment.find({
        bookId: bookObjectId,
        $text: { $search: queryStr },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ score: { $meta: "textScore" } })
        .limit(3)
        .lean();
    } catch {
      segments = [];
    }

    if (segments.length === 0) {
      const keywords = queryStr.split(/\s+/).filter((k) => k.length > 2);
      const pattern = keywords.map(escapeRegex).join("|");
      segments = await BookSegment.find({
        bookId: bookObjectId,
        content: { $regex: pattern, $options: "i" },
      })
        .select("_id bookId content segmentIndex pageNumber wordCount")
        .sort({ segmentIndex: 1 })
        .limit(3)
        .lean();
    }

    if (!segments.length) {
      return { result: "No information found about this topic in the book." };
    }

    const combinedText = segments.map((s) => s.content).join("\n\n");
    return { result: combinedText };
  } catch (error) {
    console.error("Vapi processBookSearch error:", error);
    return { result: "Error retrieving book contents." };
  }
}

function parseArgs(args: unknown): Record<string, unknown> {
  if (!args) return {};
  if (typeof args === "string") {
    try {
      return JSON.parse(args);
    } catch {
      return {};
    }
  }
  return args as Record<string, unknown>;
}

export const searchBookVapi = async (req: Request, res: Response) => {
  if (req.method === "GET") {
    return res.json({ status: "ok" });
  }

  try {
    const body = req.body;
    const functionCall = body?.message?.functionCall;
    const toolCallList = body?.message?.toolCallList || body?.message?.toolCalls;

    if (functionCall) {
      const { name, parameters } = functionCall;
      const parsed = parseArgs(parameters);

      if (name === "searchBook") {
        const result = await processBookSearch(parsed.bookId, parsed.query);
        return res.json(result);
      }
      return res.json({ result: `Unknown function: ${name}` });
    }

    if (!toolCallList || toolCallList.length === 0) {
      return res.json({ results: [{ result: "No tool calls found" }] });
    }

    const results = [];
    for (const toolCall of toolCallList) {
      const { id, function: func } = toolCall;
      const name = func?.name;
      const args = parseArgs(func?.arguments);

      if (name === "searchBook") {
        const searchResult = await processBookSearch(args.bookId, args.query);
        results.push({
          toolCallId: id,
          role: "tool",
          name: "searchBook",
          result: searchResult.result,
        });
      } else {
        results.push({ toolCallId: id, result: `Unknown function: ${name}` });
      }
    }

    return res.json({ results });
  } catch (error) {
    console.error("Vapi search-book error:", error);
    return res.status(500).json({
      results: [{ result: "Error processing request" }],
    });
  }
};

export const logVapi = async (req: Request, res: Response) => {
  try {
    console.log("[VAPI BROWSER LOG]:", JSON.stringify(req.body, null, 2));
    return res.json({ success: true });
  } catch {
    return res.json({ success: false });
  }
};
