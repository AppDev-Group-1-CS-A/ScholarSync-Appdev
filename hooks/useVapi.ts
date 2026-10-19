"use client";

// Create hooks/useVapi.ts: the core hook. Initializes Vapi SDK, manages call lifecycle (idle, connecting, starting, listening, thinking, speaking), tracks messages array + currentMessage streaming, handles duration timer with maxDuration enforcement, session tracking via server actions

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { useSession } from "@/hooks/useSession";

import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constants";
import { getVoice } from "@/lib/utils";
import { IBook, Messages } from "@/types";
import {
  startVoiceSession,
  endVoiceSession,
} from "@/lib/actions/session.actions";

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const TIME_WARNING_THRESHOLD = 60; // Show warning when this many seconds remain

let vapi: InstanceType<typeof Vapi>;
function getVapi() {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error(
        "NEXT_PUBLIC_VAPI_API_KEY environment variable is not set",
      );
    }
    vapi = new Vapi(VAPI_API_KEY);
  }
  return vapi;
}

export type CallStatus =
  | "idle"
  | "connecting"
  | "starting"
  | "listening"
  | "thinking"
  | "searching"
  | "speaking";

export function useVapi(book: IBook) {
  const { session } = useSession();
  const userId = session?.userId;
  // const { limits } = useSubscription();

  const [status, setStatus] = useState<CallStatus>("idle");
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef(false);

  // Keep refs in sync with latest values for use in callbacks
  // const maxDurationRef = useLatestRef(limits.maxSessionMinutes * 60);
  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  const pendingInitialMessage = useRef<string | null>(null);

  // Pre-initialize Vapi on mount to avoid startup delay
  useEffect(() => {
    try {
      getVapi(); // Initialize Vapi instance once
    } catch (err) {
      console.error("Failed to initialize Vapi:", err);
    }
  }, []);

  // Set up Vapi event listeners
  useEffect(() => {
    const handlers = {
      "call-start": () => {
        isStoppingRef.current = false;
        setStatus("starting");
        setCurrentAssistantMessage("");
        setCurrentUserMessage("");

        // If we have a pending message from a quick prompt, send it now
        if (pendingInitialMessage.current) {
          const text = pendingInitialMessage.current;
          pendingInitialMessage.current = null;

          // Small delay to ensure the session is ready to receive messages
          setTimeout(() => {
            getVapi().send({
              type: "add-message",
              message: {
                role: "user",
                content: text,
              },
            });
            setStatus("thinking");
          }, 1000);
        }

        // Start duration timer
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
          if (startTimeRef.current) {
            const newDuration = Math.floor(
              (Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS,
            );
            setDuration(newDuration);
          }
        }, TIMER_INTERVAL_MS);
      },

      "call-end": () => {
        // Don't reset isStoppingRef here - delayed events may still fire
        setStatus("idle");
        setCurrentAssistantMessage("");
        setCurrentUserMessage("");

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // End session tracking
        if (sessionIdRef.current) {
          endVoiceSession(sessionIdRef.current, durationRef.current).catch(
            (err) => console.error("Failed to end voice session:", err),
          );
          sessionIdRef.current = null;
        }

        startTimeRef.current = null;
      },

      "speech-start": () => {
        if (!isStoppingRef.current) {
          setStatus("speaking");
        }
      },
      "speech-end": () => {
        if (!isStoppingRef.current) {
          // After AI finishes speaking, user can talk
          setStatus("listening");
        }
      },

      message: (message: any) => {
        // Handle tool calls for searching status
        if (message.type === "tool-calls") {
          const isSearching = message.toolCalls?.some(
            (tc: any) => tc.function?.name === "searchBook",
          );
          if (isSearching && !isStoppingRef.current) {
            setStatus("searching");
          }
          return;
        }

        if (message.type !== "transcript") return;

        console.log(
          "📝 Vapi Transcript:",
          message.role,
          message.transcriptType,
          message.transcript,
        );

        // Partial transcript → show real-time typing
        if (message.transcriptType === "partial") {
          if (message.role === "user") {
            setCurrentUserMessage(message.transcript);
          } else if (message.role === "assistant") {
            setCurrentAssistantMessage(message.transcript);
            // If we're starting to get an assistant transcript, we're definitely speaking/responding
            if (status !== "speaking" && !isStoppingRef.current) {
              setStatus("speaking");
            }
          }
          return;
        }

        // Final transcript → add to messages
        if (message.transcriptType === "final") {
          // Clear appropriate streaming state
          if (message.role === "user") {
            if (!isStoppingRef.current) {
              setStatus("thinking");
            }
            setCurrentUserMessage("");
          } else if (message.role === "assistant") {
            setCurrentAssistantMessage("");
          }

          // Add to messages array with deduplication
          setMessages((prev) => {
            const isDupe = prev.some(
              (m) =>
                m.role === message.role && m.content === message.transcript,
            );
            if (isDupe) return prev;

            return [
              ...prev,
              { role: message.role, content: message.transcript },
            ];
          });
        }
      },

      error: (error: Error) => {
        console.error("Vapi error:", error);
        // Don't reset isStoppingRef here - delayed events may still fire
        setStatus("idle");
        setCurrentAssistantMessage("");
        setCurrentUserMessage("");

        // Stop timer on error
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // End session tracking on error
        if (sessionIdRef.current) {
          endVoiceSession(sessionIdRef.current, durationRef.current).catch(
            (err) =>
              console.error("Failed to end voice session on error:", err),
          );
          sessionIdRef.current = null;
        }

        // Show user-friendly error message
        const errorMessage = error.message?.toLowerCase() || "";
        if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("silence")
        ) {
          setLimitError(
            "Session ended due to inactivity. Click the mic to start again.",
          );
        } else if (
          errorMessage.includes("network") ||
          errorMessage.includes("connection")
        ) {
          setLimitError(
            "Connection lost. Please check your internet and try again.",
          );
        } else {
          setLimitError(
            "Session ended unexpectedly. Click the mic to start again.",
          );
        }

        startTimeRef.current = null;
      },
    };

    // Register all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      getVapi().on(event as keyof typeof handlers, handler as () => void);
    });

    return () => {
      // End active session on unmount
      if (sessionIdRef.current) {
        getVapi().stop();
        endVoiceSession(sessionIdRef.current, durationRef.current).catch(
          (err) =>
            console.error("Failed to end voice session on unmount:", err),
        );
        sessionIdRef.current = null;
      }
      // Cleanup handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        getVapi().off(event as keyof typeof handlers, handler as () => void);
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const start = useCallback(
    async (initialUserMessage?: string) => {
      if (!userId) {
        setLimitError("Please sign in to start a voice session.");
        return;
      }

      // Store the user message to send it as soon as we connect
      if (initialUserMessage) {
        pendingInitialMessage.current = initialUserMessage;

        // Also add it to the local messages state so the user sees it immediately
        setMessages((prev) => [
          ...prev,
          { role: "user", content: initialUserMessage },
        ]);
      }

      setLimitError(null);
      setStatus("connecting");

      try {
        console.log("🎤 start function: checking session/userId", { userId });
        // Run microphone check and session creation in parallel
        const [stream, sessionResult] = await Promise.all([
          navigator.mediaDevices.getUserMedia({ audio: true }),
          startVoiceSession(userId!, book._id),
        ]);

        console.log("🎤 start function: sessionResult", sessionResult);

        // Stop microphone stream immediately after permission check
        stream.getTracks().forEach((track) => track.stop());
        console.log("✓ Microphone access granted");

        if (!sessionResult.success) {
          setLimitError(
            sessionResult.error ||
              "Session limit reached. Please upgrade your plan.",
          );
          setStatus("idle");
          return;
        }

        sessionIdRef.current = sessionResult.sessionId || null;

        // Use the actual voice name for a more personal introduction
        const voiceName = getVoice(voice).name;

        // If there's an initial user message, the AI should give a brief acknowledgement
        // otherwise, use the standard greeting.
        const firstMessage = initialUserMessage
          ? `Sure! Let me look into that for you.`
          : `Hey! I'm ${voiceName}, your AI learning partner for ${book.title}. Ready to dive in?`;

        const systemPrompt = `You are ${voiceName}, a specialized Student Learning Assistant for the book: "${book.title}" by ${book.author}.

PERSONALITY & VOICE:
- Be warm, encouraging, and highly conversational.
- Use natural filler phrases like "Hmm, let me see...", "That's an interesting point, give me a second to check the text...", or "I'm looking that up for you right now."
- If you need to use the 'searchBook' tool, ALWAYS acknowledge the request first with a brief filler so the student knows you are working.
- Keep your responses concise and focused on the audio format—don't use long lists or complex formatting.

INSTRUCTIONS:
- Use the 'searchBook' tool to find specific content from the book to answer the student's questions accurately.
- ALWAYS search the book if the student asks about specific facts, summaries, or concepts from the material.
- If the search results are empty, inform the student but provide general academic guidance.
- Break down complex topics into simple terms.

The current bookId is: ${book._id}`;

        console.log("🎤 Starting VAPI call with ASSISTANT_ID:", ASSISTANT_ID);

        await getVapi().start(ASSISTANT_ID, {
          firstMessage,
          silenceTimeoutSeconds: 120, // Increased to 2 minutes
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "searchBook",
                  description:
                    "Search for specific content or information within the book to answer questions accurately.",
                  parameters: {
                    type: "object",
                    properties: {
                      query: {
                        type: "string",
                        description:
                          "The search query or topic to look up in the book.",
                      },
                      bookId: {
                        type: "string",
                        description: "The ID of the book to search within.",
                      },
                    },
                    required: ["query", "bookId"],
                  },
                },
                server: {
                  // Use NEXT_PUBLIC_BASE_URL if set, otherwise fallback to window.location.origin
                  // IMPORTANT: If window.location.origin is localhost, Vapi won't be able to hit this.
                  url: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/vapi/search-book`,
                },
              },
            ],
          },
          variableValues: {
            title: book.title,
            author: book.author,
            bookId: book._id,
          },
          voice: {
            provider: "11labs" as const,
            voiceId: getVoice(voice).id,
            model: "eleven_turbo_v2_5" as const,
            stability: VOICE_SETTINGS.stability,
            similarityBoost: VOICE_SETTINGS.similarityBoost,
            style: VOICE_SETTINGS.style,
            useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
          },
        } as any);
      } catch (err) {
        console.error("Failed to start call:", err);
        setStatus("idle");

        // Handle specific error types
        const errorMessage = (err as Error).message?.toLowerCase() || "";
        if (
          errorMessage.includes("notallowederror") ||
          errorMessage.includes("permission")
        ) {
          setLimitError(
            "Microphone access denied. Please allow access in your browser settings.",
          );
        } else {
          setLimitError("Failed to start voice session. Please try again.");
        }
      }
    },
    [book._id, book.title, book.author, voice, userId],
  );

  const stop = useCallback(() => {
    isStoppingRef.current = true;
    getVapi().stop();
  }, []);

  const isActive =
    status === "connecting" ||
    status === "starting" ||
    status === "listening" ||
    status === "thinking" ||
    status === "searching" ||
    status === "speaking";
  const isJoined = isActive && status !== "connecting" && status !== "starting";

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !isJoined) return;

      try {
        // Standard way to inject user message and trigger response
        getVapi().send({
          type: "add-message",
          message: {
            role: "user",
            content: text,
          },
        });

        // Add user message to messages array optimistically
        setMessages((prev) => {
          const isDupe = prev.some(
            (m) => m.role === "user" && m.content === text,
          );
          if (isDupe) return prev;
          return [...prev, { role: "user", content: text }];
        });
        setStatus("thinking");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [isJoined],
  );

  const clearError = useCallback(() => {
    setLimitError(null);
  }, []);

  // Calculate remaining time
  // const maxDurationSeconds = limits.maxSessionMinutes * SECONDS_PER_MINUTE;
  // const remainingSeconds = Math.max(0, maxDurationSeconds - duration);
  // const showTimeWarning =
  //     isActive && remainingSeconds <= TIME_WARNING_THRESHOLD && remainingSeconds > 0;

  return {
    status,
    isActive,
    messages,
    currentAssistantMessage,
    currentUserMessage,
    currentMessages: messages, // Alias for messages as requested
    duration,
    start,
    stop,
    sendMessage,
    limitError,
    clearError,
    // maxDurationSeconds,
    // remainingSeconds,
    // showTimeWarning,
  };
}

export default useVapi;
