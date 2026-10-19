"use client";

import { useEffect, useRef } from "react";
import { Messages } from "@/types";
import { User, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TranscriptProps {
  messages: Messages[];
  currentMessages?: Messages[];
  currentAssistantMessage?: string;
  currentUserMessage?: string;
  isVoiceMode?: boolean;
  status: string;
}

const Transcript = ({
  messages,
  currentMessages,
  currentAssistantMessage,
  currentUserMessage,
  isVoiceMode = false,
  status,
}: TranscriptProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayMessages = currentMessages || messages;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages, currentAssistantMessage, currentUserMessage]);

  return (
    <div
      ref={scrollRef}
      className="transcript-container flex flex-col gap-6 p-4 md:p-8"
    >
      {/* 1. Pre-recorded Message History */}
      {displayMessages.map((msg, i) => (
        <div
          key={i}
          className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
        >
          <div
            className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest ${
              msg.role === "user" ? "text-[#663820]" : "text-[#212a3b]"
            }`}
          >
            {msg.role === "user" ? (
              <>
                You <User size={12} />
              </>
            ) : (
              <>
                <BookOpen size={12} /> ScholarSync
              </>
            )}
          </div>
          <div
            className={`chat-bubble max-w-[85%] md:max-w-[75%] ${
              msg.role === "user" ? "user-bubble" : "ai-bubble"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-slate prose-sm max-w-none prose-headings:font-serif prose-headings:text-[#212a3b] prose-strong:text-[#663820] prose-p:leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
        </div>
      ))}

      {/* 2. Real-time Streaming User Message */}
      {currentUserMessage && (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-[#663820]">
            You <User size={12} />
          </div>
          <div className="chat-bubble user-bubble max-w-[85%] md:max-w-[75%] opacity-70">
            <p className="whitespace-pre-wrap">{currentUserMessage}</p>
          </div>
        </div>
      )}

      {/* 3. Real-time Streaming Assistant Message */}
      {currentAssistantMessage && (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-[#212a3b]">
            <BookOpen size={12} /> ScholarSync
          </div>
          <div className="chat-bubble ai-bubble max-w-[85%] md:max-w-[75%]">
            <div className="prose prose-slate prose-sm max-w-none prose-headings:font-serif prose-headings:text-[#212a3b] prose-strong:text-[#663820] prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentAssistantMessage}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* 4. Thinking / Searching Status */}
      {(status === "thinking" || status === "searching") &&
        !currentAssistantMessage && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-[#212a3b]">
              <BookOpen size={12} /> ScholarSync
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-black/5 rounded-2xl p-4 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#212a3b] rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-[#212a3b] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-[#212a3b] rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <span className="text-xs text-[#3d485e] italic">
                {status === "searching"
                  ? "Searching your book..."
                  : "Synthesizing answer..."}
              </span>
            </div>
          </div>
        )}
    </div>
  );
};

export default Transcript;
