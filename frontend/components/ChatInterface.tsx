"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import { IBook, Messages } from "@/types";
import {
  Send,
  BookOpen,
  GraduationCap,
  Lightbulb,
  HelpCircle,
  Loader2,
  User,
  Trash2,
  ChevronLeft,
  Sparkles,
  Search,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chatWithBook } from "@/lib/actions/chat.actions";
import { toast } from "sonner";
import useVapi from "@/hooks/useVapi";
import ReaderAppearanceControls, {
  type ReaderTheme,
} from "@/components/ReaderAppearanceControls";

const READER_THEME_KEY = "scholarsync_reader_theme";
const READER_FONTSIZE_KEY = "scholarsync_reader_fontsize";
const DEFAULT_FONT_SIZE = 16;

const readerThemePalette: Record<
  ReaderTheme,
  {
    background: string;
    panel: string;
    panelStrong: string;
    text: string;
    muted: string;
    border: string;
    input: string;
    accent: string;
    accentText: string;
  }
> = {
  light: {
    background: "#ffffff",
    panel: "#f3e4c7",
    panelStrong: "#f8f1e4",
    text: "#212a3b",
    muted: "#3d485e",
    border: "rgba(33, 42, 59, 0.12)",
    input: "#f5f5f5",
    accent: "#663820",
    accentText: "#ffffff",
  },
  sepia: {
    background: "#fbf0d9",
    panel: "#f3dfb7",
    panelStrong: "#f8ebd0",
    text: "#433422",
    muted: "#5d4835",
    border: "rgba(67, 52, 34, 0.18)",
    input: "#f8f3ea",
    accent: "#7c4f2b",
    accentText: "#fffaf5",
  },
  dark: {
    background: "#181926",
    panel: "#202536",
    panelStrong: "#262d3d",
    text: "#cad3f5",
    muted: "#b7bfd6",
    border: "rgba(202, 211, 245, 0.12)",
    input: "#1d2333",
    accent: "#8ab4f8",
    accentText: "#0b1220",
  },
};

const ChatInterface = ({ book }: { book: IBook }) => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("light");
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = window.localStorage.getItem(READER_THEME_KEY) as
      | ReaderTheme
      | null;
    if (savedTheme === "light" || savedTheme === "sepia" || savedTheme === "dark") {
      setReaderTheme(savedTheme);
    }

    const savedFontSize = Number(window.localStorage.getItem(READER_FONTSIZE_KEY));
    if (!Number.isNaN(savedFontSize)) {
      const nextFontSize = Math.min(22, Math.max(14, savedFontSize));
      setFontSize(nextFontSize);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(READER_THEME_KEY, readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(READER_FONTSIZE_KEY, String(fontSize));
  }, [fontSize]);

  // Vapi Integration
  const {
    status,
    isActive,
    messages: vapiMessages,
    currentAssistantMessage,
    currentUserMessage,
    start: startVapi,
    stop: stopVapi,
    sendMessage: sendVapiMessage,
    limitError,
  } = useVapi(book);

  useEffect(() => {
    if (limitError) {
      toast.error(limitError);
    }
  }, [limitError]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [
    messages,
    vapiMessages,
    isLoading,
    currentAssistantMessage,
    currentUserMessage,
  ]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    if (isVoiceMode) {
      if (isActive && status !== "connecting" && status !== "starting") {
        sendVapiMessage(messageText);
      } else if (isActive) {
        toast.info(
          "Voice conversation is still connecting. Please wait a moment.",
        );
        return;
      } else {
        // Start the voice session with this message
        try {
          await startVapi(messageText);
        } catch (error) {
          console.error("Failed to start voice session:", error);
        }
      }
      setInput("");
      return;
    }

    const userMsg: Messages = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chatWithBook(
        book._id,
        book.title,
        messageText,
        messages,
      );

      if (result.success && result.data) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.data as string },
        ]);
      } else {
        toast.error(result.error || "Failed to get a response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("An error occurred with the AI connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceMode = () => {
    // We don't stopVapi here anymore so the conversation stays active in the background
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      toast.info("Voice mode enabled.");
    } else {
      toast.success("Silent mode enabled.");
    }
  };

  const clearChat = () => {
    setIsMenuOpen(false);
    if (messages.length === 0 && vapiMessages.length === 0) return;
    if (confirm("Clear all messages in this session?")) {
      setMessages([]);
      if (isActive) stopVapi();
    }
  };

  const handleThemeChange = (nextTheme: ReaderTheme) => {
    setReaderTheme(nextTheme);
  };

  const handleFontSizeChange = (nextFontSize: number) => {
    setFontSize(Math.min(22, Math.max(14, nextFontSize)));
  };

  const palette = readerThemePalette[readerTheme];
  const shellStyle: CSSProperties = {
    background: palette.background,
    color: palette.text,
    borderColor: palette.border,
    fontSize: `${fontSize}px`,
    ["--reader-bg" as string]: palette.background,
    ["--reader-panel" as string]: palette.panel,
    ["--reader-panel-strong" as string]: palette.panelStrong,
    ["--reader-text" as string]: palette.text,
    ["--reader-muted" as string]: palette.muted,
    ["--reader-border" as string]: palette.border,
    ["--reader-input" as string]: palette.input,
    ["--reader-accent" as string]: palette.accent,
    ["--reader-accent-text" as string]: palette.accentText,
  };

  const textPrompts = [
    {
      label: "Summarize",
      icon: <BookOpen size={16} />,
      text: "Can you summarize the main points of this material?",
    },
    {
      label: "Study Guide",
      icon: <GraduationCap size={16} />,
      text: "Create a study guide for the most important concepts in this book.",
    },
    {
      label: "Quiz Me",
      icon: <HelpCircle size={16} />,
      text: "Give me 5 practice questions to test my knowledge of this material.",
    },
    {
      label: "Explain",
      icon: <Lightbulb size={16} />,
      text: "Explain the most complex part of this book in simple terms.",
    },
  ];

  const displayMessages = isVoiceMode ? vapiMessages : messages;

  return (
    <div
      className="reader-shell flex flex-col h-[calc(100vh-140px)] w-full max-w-5xl mx-auto rounded-2xl shadow-soft-lg overflow-hidden border"
      style={shellStyle}
      data-theme={readerTheme}
    >
      {/* Top Header / Navigation */}
      <div className="reader-header px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-[#212a3b]" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-8 relative shadow-md rounded overflow-hidden hidden sm:block">
              <Image
                src={book.coverURL || "/assets/book-cover.svg"}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#212a3b] line-clamp-1">
                {book.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#663820]">
                  <Sparkles size={10} /> Student Assistant
                </span>
                <span className="h-1 w-1 bg-black/20 rounded-full" />
                <span className="text-[10px] text-gray-500 font-medium">
                  {isVoiceMode
                    ? isActive
                      ? "Voice Active"
                      : "Voice Mode"
                    : "Text Mode"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ReaderAppearanceControls
            theme={readerTheme}
            fontSize={fontSize}
            onThemeChange={handleThemeChange}
            onFontSizeChange={handleFontSizeChange}
          />

          {/* Voice Mode Toggle */}
          <button
            onClick={toggleVoiceMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isVoiceMode
                ? "reader-voice-toggle active"
                : "reader-voice-toggle"
            }`}
            title={isVoiceMode ? "Disable Voice" : "Enable Voice"}
          >
            {isVoiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">
              {isVoiceMode ? "Voice On" : "Voice Off"}
            </span>
          </button>

          {/* More Options Menu (Three Dots) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-full transition-all ${isMenuOpen ? "bg-black/10 text-[#212a3b]" : "text-gray-500 hover:text-[#212a3b] hover:bg-black/5"}`}
              title="More options"
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={clearChat}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                >
                  <Trash2 size={16} />
                  Clear Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="reader-messages-panel flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth">
        {displayMessages.length === 0 &&
        !currentAssistantMessage &&
        !currentUserMessage ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="bg-[#663820] p-5 rounded-3xl mb-6 shadow-lg rotate-3">
              <GraduationCap size={40} className="text-white" />
            </div>
            <h1 className="reader-empty-title text-2xl sm:text-3xl font-serif font-bold mb-4">
              Hello, Student! I'm your AI Learning Partner.
            </h1>
            <p className="reader-empty-copy text-lg mb-8 leading-relaxed">
              I've analyzed{" "}
              <span className="font-bold text-[#663820]">"{book.title}"</span>{" "}
              and I'm ready to help you study.
            </p>

            {isVoiceMode && !isActive ? (
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button
                  onClick={() => startVapi()}
                  disabled={status === "connecting"}
                  className="flex items-center gap-3 px-8 py-4 bg-[#663820] text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-[#7a4528] hover:scale-105 transition-all group"
                >
                  {status === "connecting" ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Volume2
                        size={24}
                        className="group-hover:animate-pulse"
                      />
                      <span>Start Voice Conversation</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">
                  AI will start the conversation first
                </p>
              </div>
            ) : (
              <>
                <p className="reader-empty-copy text-lg mb-10 leading-relaxed">
                  {isVoiceMode
                    ? "Voice mode is active. Speak or type to chat."
                    : "Type a message below to start chatting."}
                </p>

                {!isVoiceMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {textPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="reader-prompt-card flex items-center gap-4 p-4 text-left transition-all rounded-xl border shadow-sm group"
                      >
                        <div className="reader-prompt-icon p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                          {prompt.icon}
                        </div>
                        <span className="reader-prompt-label font-bold text-sm">
                          {prompt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto w-full">
            {displayMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#212a3b] text-white"
                      : "bg-[#663820] text-white"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </div>

                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`reader-message-bubble px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-sm leading-relaxed text-sm sm:text-base ${
                      msg.role === "user"
                        ? "reader-message-user rounded-tr-none"
                        : "reader-message-assistant rounded-tl-none"
                    }`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <div className="reader-message-content whitespace-pre-wrap prose prose-sm max-w-none prose-p:leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                  <span className="text-[10px] mt-1.5 text-gray-400 font-medium px-1">
                    {msg.role === "user" ? "You" : "Student Assistant"}
                  </span>
                </div>
              </div>
            ))}

            {currentUserMessage && (
              <div className="flex gap-3 sm:gap-4 flex-row-reverse animate-in fade-in duration-300">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#212a3b] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User size={20} />
                </div>
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                  <div className="reader-message-bubble reader-message-user px-4 py-3 sm:px-6 sm:py-4 rounded-2xl rounded-tr-none shadow-sm text-sm sm:text-base italic opacity-70" style={{ fontSize: `${fontSize}px` }}>
                    {currentUserMessage}...
                  </div>
                </div>
              </div>
            )}

            {currentAssistantMessage && (
              <div className="flex gap-3 sm:gap-4 flex-row animate-in fade-in duration-300">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#663820] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
                  <div className="reader-message-bubble reader-message-assistant px-4 py-3 sm:px-6 sm:py-4 rounded-2xl rounded-tl-none shadow-sm text-sm sm:text-base" style={{ fontSize: `${fontSize}px` }}>
                    {currentAssistantMessage}
                    <span className="inline-block w-1.5 h-4 ml-1 bg-[#663820] animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {isLoading && !isVoiceMode && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="h-10 w-10 rounded-full bg-[#663820] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <div className="reader-loading-bubble border px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-[#663820]/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#663820]/60 rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#663820]/80 rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#663820] tracking-wider uppercase italic">
                    Searching pages...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="reader-input-panel p-4 sm:p-6 border-t">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#663820] transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isVoiceMode
                  ? "Type a message to chat..."
                  : "Ask a question about this material..."
              }
              className="reader-input w-full pl-12 pr-16 py-4 rounded-2xl focus:outline-none focus:ring-2 transition-all shadow-inner"
              style={{ fontSize: `${fontSize}px` }}
              disabled={
                isLoading ||
                (isVoiceMode &&
                  (status === "connecting" || status === "starting"))
              }
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={
                isLoading ||
                !input.trim() ||
                (isVoiceMode &&
                  (status === "connecting" || status === "starting"))
              }
              className="reader-send-button absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          {/* Real-time Voice Button */}
          {isVoiceMode && (
            <div className="relative">
              {isActive && (
                <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-20" />
              )}
              <button
                onClick={isActive ? stopVapi : () => startVapi()}
                disabled={status === "connecting"}
                className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-md z-10 relative ${
                  isActive
                    ? "bg-red-500 text-white"
                    : "bg-[#212a3b] text-white hover:bg-[#3d485e]"
                }`}
                title={isActive ? "Stop Voice" : "Start Voice Conversation"}
              >
                {status === "connecting" ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : isActive ? (
                  <MicOff size={24} />
                ) : (
                  <Mic size={24} />
                )}
              </button>

              {/* Mini Waveform */}
              {isActive && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-0.5 h-3 justify-center w-12">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-0.5 bg-red-500 rounded-full transition-all duration-300 ${
                        status === "speaking" || status === "listening"
                          ? "animate-waveform"
                          : "h-0.5 opacity-30"
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height:
                          status === "speaking" || status === "listening"
                            ? "100%"
                            : "2px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="reader-status-row max-w-4xl mx-auto mt-3 flex items-center justify-center gap-4 text-[10px] font-medium">
          <span className="flex items-center gap-1">
            <BookOpen size={10} /> Context-Aware RAG
          </span>
          <span className="h-1 w-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1">
            <Sparkles size={10} />{" "}
            {isVoiceMode ? "Vapi AI Assistant" : "Powered by Llama 3.3"}
          </span>
          <span className="h-1 w-1 bg-gray-300 rounded-full" />
          <span>Educational Assistant</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
