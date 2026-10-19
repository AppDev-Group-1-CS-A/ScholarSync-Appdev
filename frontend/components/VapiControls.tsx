"use client";

import { useState } from "react";
import useVapi from "@/hooks/useVapi";
import { IBook } from "@/types";
import { Mic, MicOff, Send, MessageCircle, Volume2 } from "lucide-react";
import Image from "next/image";
import Transcript from "./Transcript";
import { formatDuration } from "@/lib/utils";

const VapiControls = ({ book }: { book: IBook }) => {
  const [textMessage, setTextMessage] = useState("");
  const [useVoice, setUseVoice] = useState(false); // Start with text-only mode
  const {
    status,
    isActive,
    messages,
    currentAssistantMessage,
    currentUserMessage,
    currentMessages,
    duration,
    start,
    stop,
    sendMessage,
    clearError,
    //limitError,
    //isBillingError,
    //maxDurationSeconds,
  } = useVapi(book);

  const handleSendMessage = async () => {
    if (!textMessage.trim()) return;

    // Auto-start the conversation if not active (works in both modes now)
    if (!isActive) {
      try {
        // Start the conversation first
        await start(textMessage);
        setTextMessage("");
      } catch (error) {
        console.error("Failed to start conversation:", error);
      }
      return;
    }

    // Normal send if already active
    sendMessage(textMessage);
    setTextMessage("");
  };

  const handleVoiceStart = () => {
    // Start voice session
    start();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <>
      <div className="vapi-header-card w-full">
        <div className="vapi-card-layout w-full">
          {/* Left: Book Cover & Mic Button (Only show if voice mode enabled) */}
          <div className="vapi-cover-wrapper">
            <Image
              src={book.coverURL || "/assets/book-cover.svg"}
              alt={book.title}
              width={162}
              height={240}
              className="vapi-cover-image"
            />
            {useVoice && (
              <div className="vapi-mic-wrapper">
                {isActive && (
                  <div className="absolute inset-0 w-[60px] h-[60px] bg-[#663820] rounded-full animate-ping opacity-25" />
                )}
                {status === "connecting" && (
                  <div className="absolute inset-0 w-[60px] h-[60px] bg-yellow-500 rounded-full animate-pulse opacity-50" />
                )}
                <button
                  onClick={isActive ? stop : handleVoiceStart}
                  disabled={status === "connecting"}
                  className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] z-10 transition-all duration-500 ${
                    isActive 
                      ? "bg-[#663820] text-white" 
                      : status === "connecting"
                        ? "bg-yellow-500 text-white"
                        : "bg-white text-[#212a3b]"
                  }`}
                >
                  {status === "connecting" ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isActive ? (
                    <MicOff className="size-7" />
                  ) : (
                    <Mic className="size-7" />
                  )}
                </button>
                
                {/* Waveform Visualizer */}
                {isActive && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 h-6 w-24 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className={`w-1 bg-[#663820] rounded-full transition-all duration-300 ${
                          status === "speaking" || status === "listening"
                            ? "animate-waveform"
                            : "h-1 opacity-30"
                        }`}
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          height: status === "speaking" || status === "listening" ? "100%" : "4px"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Book Details */}
          <div className="flex flex-col justify-center flex-1">
            <h1 className="book-title-lg">{book.title}</h1>
            <p className="subtitle mb-6">by {book.author}</p>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-3">
              <div className="vapi-status-indicator">
                <span className={`vapi-status-dot ${
                  status === "idle" ? "vapi-status-dot-ready" : 
                  status === "connecting" ? "vapi-status-dot-connecting" :
                  status === "listening" ? "vapi-status-dot-listening" :
                  status === "thinking" || status === "searching" ? "vapi-status-dot-thinking" :
                  "vapi-status-dot-speaking"
                }`} />
                <span className="vapi-status-text">
                  {status === "idle" ? (useVoice ? "Voice Mode" : "Text Mode") :
                   status === "connecting" ? "Connecting..." :
                   status === "starting" ? "Starting..." :
                   status === "listening" ? "Listening..." :
                   status === "thinking" ? "Thinking..." :
                   status === "searching" ? "Searching Book..." :
                   "Speaking..."}
                </span>
              </div>

              <div className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">
                  Voice: {book.persona || "Default"}
                </span>
              </div>

              <div className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">{formatDuration(duration)}/15:00</span>
              </div>
            </div>

            {/* Mode Toggle Button */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setUseVoice(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  !useVoice
                    ? "bg-[#212a3b] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <MessageCircle size={18} />
                Text Mode
              </button>
              <button
                onClick={() => setUseVoice(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  useVoice
                    ? "bg-[#212a3b] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Volume2 size={18} />
                Voice Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="vapi-transcript-wrapper">
        <Transcript
          messages={messages}
          currentMessages={currentMessages}
          currentAssistantMessage={currentAssistantMessage}
          currentUserMessage={currentUserMessage}
          isVoiceMode={useVoice}
          status={status}
        />
      </div>

      {/* Text Message Input - Always visible */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            useVoice
              ? "Or type a message instead..."
              : "Type a message to chat..."
          }
          disabled={status !== "idle" && !isActive}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#212a3b]"
        />
        <button
          onClick={handleSendMessage}
          disabled={(status !== "idle" && !isActive) || !textMessage.trim()}
          className="px-6 py-3 bg-[#212a3b] text-white rounded-lg hover:bg-[#3d485e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send size={18} />
          Send
        </button>
      </div>
    </>
  );
};

export default VapiControls;
