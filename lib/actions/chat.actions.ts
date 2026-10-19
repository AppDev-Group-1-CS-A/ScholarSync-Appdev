"use server";

import { searchBookSegments } from "./book.actions";
import { Messages } from "@/types";
import Groq from "groq-sdk";

const getGroq = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing in .env");
  return new Groq({ apiKey });
};

export const chatWithBook = async (
  bookId: string,
  bookTitle: string,
  userMessage: string,
  history: Messages[] = [],
) => {
  try {
    const groq = getGroq();

    // 1. Search context from your book segments
    const searchResults = await searchBookSegments(bookId, userMessage, 6);
    const context =
      searchResults.success && searchResults.data
        ? searchResults.data
            .map((s: any) => `[Page ${s.pageNumber || "?"}] ${s.content}`)
            .join("\n\n")
        : "";

    // 2. Prepare the Student Assistant instructions - Enhanced for Readability
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

    // 3. Build the conversation history
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    // 4. Call Groq
    const completion = await groq.chat.completions.create({
      messages: chatMessages as any,
      model: "openai/gpt-oss-120b",
      temperature: 0.5, // Lower temperature for more factual/structured responses
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    return {
      success: true,
      data: responseText,
    };
  } catch (error) {
    console.error("Groq Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get response from Groq",
    };
  }
};
