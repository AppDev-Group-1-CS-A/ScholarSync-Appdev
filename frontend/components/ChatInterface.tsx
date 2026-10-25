"use client";

import { useState, useRef, useEffect } from "react";
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
  Columns2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chatWithBook } from "@/lib/actions/chat.actions";
import { toast } from "sonner";
import useVapi from "@/hooks/useVapi";
import ReaderAppearanceControls, {
  ReaderTheme,
} from "./ReaderAppearanceControls";
import ReaderStudyPane from "./ReaderStudyPane";

export type ViewMode = "split" | "reader" | "chat";

const ChatInterface = ({ book }: { book: IBook }) => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Layout View Mode (Split, Reader Focus, AI Tutor Focus)
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [mobileTab, setMobileTab] = useState<"reader" | "chat">("chat");
  const [readingProgress, setReadingProgress] = useState(0);

  // Reader Appearance Controls (FE-01: Light, Sepia & Dark Mode + Font Scaling)
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(
        "scholarsync_reader_theme",
      ) as ReaderTheme;
      if (savedTheme && ["light", "sepia", "dark"].includes(savedTheme)) {
        setTheme(savedTheme);
      }
      const savedFontSize = localStorage.getItem("scholarsync_reader_fontsize");
      if (savedFontSize) {
        const parsed = parseInt(savedFontSize, 10);
        if (!isNaN(parsed) && parsed >= 14 && parsed <= 22) {
          setFontSize(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors in restricted environments
    }
  }, []);

  const handleThemeChange = (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("scholarsync_reader_theme", newTheme);
    } catch {
      // Ignore
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    try {
      localStorage.setItem("scholarsync_reader_fontsize", newSize.toString());
    } catch {
      // Ignore
    }
  };

  // Theme-aware design tokens
  const themeStyles = {
    light: {
      container: "bg-white border-black/5 text-[#212a3b]",
      header: "bg-[#f3e4c7] border-black/10 text-[#212a3b]",
      headerSubtitle: "text-gray-500",
      viewModeActive: "bg-white text-[#663820] shadow-xs font-bold",
      viewModeInactive:
        "text-[#212a3b]/70 hover:text-[#212a3b] hover:bg-black/5",
      messagesBg: "bg-[#fafafa]",
      emptyHeading: "text-[#212a3b]",
      emptySubtext: "text-[#3d485e]",
      promptCard:
        "bg-white hover:border-[#663820] hover:bg-[#fff9f0] border-black/5 text-[#212a3b]",
      assistantBubble:
        "bg-white text-[#212a3b] border border-black/5 prose-strong:text-[#663820]",
      userBubble: "bg-[#212a3b] text-white",
      userAvatar: "bg-[#212a3b] text-white",
      assistantAvatar: "bg-[#663820] text-white",
      footer: "bg-white border-black/5",
      inputField:
        "bg-gray-50 border-gray-200 text-[#212a3b] placeholder-gray-400 focus:bg-white focus:ring-[#663820]",
      footerSubtext: "text-gray-400",
      loadingBubble: "bg-white border border-black/5",
    },
    sepia: {
      container: "bg-[#fbf0d9] border-[#dec8a0] text-[#433422]",
      header: "bg-[#f0dfbe] border-[#dec8a0] text-[#433422]",
      headerSubtitle: "text-[#663820]",
      viewModeActive: "bg-[#fff8ea] text-[#663820] shadow-xs font-bold",
      viewModeInactive:
        "text-[#433422]/70 hover:text-[#433422] hover:bg-[#dec8a0]/30",
      messagesBg: "bg-[#f7ebd2]",
      emptyHeading: "text-[#433422]",
      emptySubtext: "text-[#663820]",
      promptCard:
        "bg-[#fff8ea] hover:border-[#663820] hover:bg-[#fcf4e3] border-[#dec8a0] text-[#433422]",
      assistantBubble:
        "bg-[#fff8ea] text-[#433422] border border-[#dec8a0] prose-strong:text-[#663820]",
      userBubble: "bg-[#663820] text-[#fff8ea]",
      userAvatar: "bg-[#663820] text-white",
      assistantAvatar: "bg-[#8a4b2a] text-white",
      footer: "bg-[#f0dfbe] border-[#dec8a0]",
      inputField:
        "bg-[#fff8ea] border-[#dec8a0] text-[#433422] placeholder-[#8a7258] focus:bg-[#fffdf8] focus:ring-[#663820]",
      footerSubtext: "text-[#8a7258]",
      loadingBubble: "bg-[#fff8ea] border border-[#dec8a0]",
    },
    dark: {
      container: "bg-[#181926] border-[#363a4f] text-[#cad3f5]",
      header: "bg-[#1e2030] border-[#363a4f] text-[#cad3f5]",
      headerSubtitle: "text-[#a5adcb]",
      viewModeActive: "bg-[#24273a] text-[#f5a97f] shadow-xs font-bold",
      viewModeInactive:
        "text-[#cad3f5]/70 hover:text-[#cad3f5] hover:bg-white/5",
      messagesBg: "bg-[#141520]",
      emptyHeading: "text-[#cad3f5]",
      emptySubtext: "text-[#a5adcb]",
      promptCard:
        "bg-[#24273a] hover:border-[#cad3f5] hover:bg-[#363a4f] border-[#363a4f] text-[#cad3f5]",
      assistantBubble:
        "bg-[#24273a] text-[#cad3f5] border border-[#363a4f] prose-strong:text-[#f5a97f]",
      userBubble: "bg-[#363a4f] text-[#c6d0f5]",
      userAvatar: "bg-[#363a4f] text-[#cad3f5]",
      assistantAvatar: "bg-[#f5a97f] text-[#181926]",
      footer: "bg-[#1e2030] border-[#363a4f]",
      inputField:
        "bg-[#24273a] border-[#363a4f] text-[#cad3f5] placeholder-[#6e738d] focus:bg-[#303446] focus:ring-[#cad3f5]",
      footerSubtext: "text-[#6e738d]",
      loadingBubble: "bg-[#24273a] border border-[#363a4f]",
    },
  };
  const currentStyles = themeStyles[theme];

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - clientHeight > 0) {
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  const handleQuoteToChat = (quoteText: string) => {
    const snippet =
      quoteText.length > 250 ? quoteText.slice(0, 250) + "..." : quoteText;
    setInput(
      `Regarding this passage: "${snippet}"\n\nCould you explain this in simpler terms?`,
    );
    if (viewMode === "reader") {
      setViewMode("split");
    }
    setMobileTab("chat");
    toast.success("Passage quoted to AI Tutor input!");
  };

  const handleAskConcept = (prompt: string) => {
    handleSendMessage(prompt);
    if (viewMode === "reader") {
      setViewMode("split");
    }
    setMobileTab("chat");
  };

  const displayMessages = isVoiceMode ? vapiMessages : messages;

  return (
    <div
      data-theme={theme}
      className={`flex flex-col h-[calc(100vh-76px)] sm:h-[calc(100vh-84px)] w-full max-w-[1740px] mx-auto rounded-2xl shadow-soft-lg overflow-hidden border transition-colors duration-300 ${currentStyles.container}`}
    >
      {/* Top Header / Navigation */}
      <div
        className={`px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between border-b transition-colors duration-300 gap-2 shrink-0 ${currentStyles.header}`}
      >
        {/* Left: Back & Book Details */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors shrink-0"
            title="Back to Library"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-7 sm:h-10 sm:w-8 relative shadow-sm rounded overflow-hidden hidden sm:block shrink-0 border border-black/10">
              <Image
                src={book.coverURL || "/assets/book-cover.svg"}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold line-clamp-1">
                {book.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#663820] dark:text-[#f5a97f] shrink-0">
                  <Sparkles size={10} /> Student Assistant
                </span>
                <span className="h-1 w-1 bg-black/20 dark:bg-white/20 rounded-full shrink-0" />
                <span
                  className={`text-[10px] font-medium truncate ${currentStyles.headerSubtitle}`}
                >
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

        {/* Center: View Mode Segmented Controls */}
        <div className="flex items-center shrink-0">
          {/* Desktop segmented controls */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                viewMode === "split"
                  ? currentStyles.viewModeActive
                  : currentStyles.viewModeInactive
              }`}
              title="Split View: Dual Study Pane + AI Tutor"
            >
              <Columns2 size={13} />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("reader")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                viewMode === "reader"
                  ? currentStyles.viewModeActive
                  : currentStyles.viewModeInactive
              }`}
              title="Study Pane Focus: AI Summaries & Book Excerpts"
            >
              <BookOpen size={13} />
              <span>Study Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chat")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                viewMode === "chat"
                  ? currentStyles.viewModeActive
                  : currentStyles.viewModeInactive
              }`}
              title="AI Tutor Focus: Chat & Voice Companion"
            >
              <MessageCircle size={13} />
              <span>AI Tutor</span>
            </button>
          </div>

          {/* Mobile switcher */}
          <div className="flex md:hidden items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/5">
            <button
              type="button"
              onClick={() => {
                setViewMode("split");
                setMobileTab("reader");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mobileTab === "reader"
                  ? currentStyles.viewModeActive
                  : currentStyles.viewModeInactive
              }`}
            >
              <BookOpen size={12} />
              <span>Study</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("split");
                setMobileTab("chat");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mobileTab === "chat"
                  ? currentStyles.viewModeActive
                  : currentStyles.viewModeInactive
              }`}
            >
              <MessageCircle size={12} />
              <span>Tutor</span>
            </button>
          </div>
        </div>

        {/* Right: Appearance, Voice Toggle, Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Reader Appearance Controls (Light, Sepia, Dark + Font Scaling) */}
          <ReaderAppearanceControls
            theme={theme}
            onThemeChange={handleThemeChange}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
          />

          {/* Voice Mode Toggle */}
          <button
            onClick={toggleVoiceMode}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isVoiceMode
                ? "bg-[#663820] text-white shadow-sm"
                : theme === "dark"
                  ? "bg-[#24273a] text-[#cad3f5] hover:bg-[#363a4f] border border-[#363a4f]"
                  : theme === "sepia"
                    ? "bg-[#f3e4c7] text-[#433422] hover:bg-[#eed8b6] border border-[#dec8a0]"
                    : "bg-white/70 text-[#212a3b] hover:bg-white border border-black/10"
            }`}
            title={isVoiceMode ? "Disable Voice" : "Enable Voice"}
          >
            {isVoiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden lg:inline">
              {isVoiceMode ? "Voice On" : "Voice Off"}
            </span>
          </button>

          {/* More Options Menu (Three Dots) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 sm:p-2 rounded-full transition-all opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
              title="More options"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2030] rounded-xl shadow-xl border border-black/10 dark:border-white/10 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={clearChat}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium text-left"
                >
                  <Trash2 size={16} />
                  Clear Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reading Progress Tracker (Issue Task 1.2) */}
      <div className="w-full h-[3px] bg-black/5 dark:bg-white/5 relative overflow-hidden shrink-0">
        <div
          className="h-full bg-gradient-to-r from-[#663820] via-[#c8553d] to-[#d4a853] transition-all duration-150"
          style={{ width: `${Math.max(readingProgress, 4)}%` }}
        />
      </div>

      {/* Expansive Dual-Pane Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Study Guide, Book Excerpts & Info */}
        <div
          onScroll={handleScroll}
          className={`overflow-hidden transition-all duration-200 ${
            viewMode === "reader"
              ? "w-full h-full flex"
              : viewMode === "chat"
                ? "hidden"
                : "w-full md:w-1/2 h-full md:border-r border-black/10 dark:border-[#363a4f] " +
                  (mobileTab === "reader" ? "flex" : "hidden md:flex")
          }`}
        >
          <ReaderStudyPane
            book={book}
            theme={theme}
            fontSize={fontSize}
            onQuoteToChat={handleQuoteToChat}
            onAskConcept={handleAskConcept}
          />
        </div>

        {/* Right Pane: AI Conversational Tutor */}
        <div
          className={`flex-col overflow-hidden transition-all duration-200 ${
            viewMode === "chat"
              ? "w-full h-full flex"
              : viewMode === "reader"
                ? "hidden"
                : "w-full md:w-1/2 h-full " +
                  (mobileTab === "chat" ? "flex" : "hidden md:flex")
          }`}
        >
          {/* Messages Area */}
          <div
            onScroll={handleScroll}
            className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth transition-colors duration-300 ${currentStyles.messagesBg}`}
          >
            {displayMessages.length === 0 &&
            !currentAssistantMessage &&
            !currentUserMessage ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-4">
                <div className="bg-[#663820] p-4 rounded-2xl mb-4 shadow-lg rotate-2">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <h1
                  className={`text-xl sm:text-2xl font-serif font-bold mb-2 ${currentStyles.emptyHeading}`}
                >
                  Hello, Student! I'm your AI Learning Partner.
                </h1>
                <p
                  className={`text-sm mb-6 leading-relaxed ${currentStyles.emptySubtext}`}
                >
                  I've analyzed{" "}
                  <span className="font-bold text-[#663820] dark:text-[#f5a97f]">
                    "{book.title}"
                  </span>{" "}
                  and I'm ready to help you study.
                </p>

                {isVoiceMode && !isActive ? (
                  <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <button
                      onClick={() => startVapi()}
                      disabled={status === "connecting"}
                      className="flex items-center gap-3 px-6 py-3.5 bg-[#663820] text-white rounded-2xl font-bold text-base shadow-xl hover:bg-[#7a4528] hover:scale-105 transition-all group"
                    >
                      {status === "connecting" ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Volume2
                            size={20}
                            className="group-hover:animate-pulse"
                          />
                          <span>Start Voice Conversation</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] opacity-50 mt-3 font-medium uppercase tracking-widest">
                      AI will start the conversation first
                    </p>
                  </div>
                ) : (
                  <>
                    <p
                      className={`text-sm mb-6 leading-relaxed ${currentStyles.emptySubtext}`}
                    >
                      {isVoiceMode
                        ? "Voice mode is active. Speak or type to chat."
                        : "Type a question below or choose a study prompt:"}
                    </p>

                    {!isVoiceMode && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {textPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(prompt.text)}
                            className={`flex items-center gap-3 p-3.5 text-left transition-all rounded-xl shadow-xs group ${currentStyles.promptCard}`}
                          >
                            <div className="bg-[#f3e4c7] dark:bg-[#363a4f] p-2 rounded-lg text-[#663820] dark:text-[#f5a97f] group-hover:scale-110 transition-transform shrink-0">
                              {prompt.icon}
                            </div>
                            <span className="font-bold text-xs">
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
              <div className="space-y-6 max-w-3xl mx-auto w-full">
                {displayMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        msg.role === "user"
                          ? currentStyles.userAvatar
                          : currentStyles.assistantAvatar
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </div>

                    <div
                      className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm leading-relaxed ${
                          msg.role === "user"
                            ? `${currentStyles.userBubble} rounded-tr-none`
                            : `${currentStyles.assistantBubble} rounded-tl-none`
                        }`}
                      >
                        <div
                          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                          className="whitespace-pre-wrap prose prose-sm max-w-none prose-p:leading-relaxed"
                        >
                          {msg.content}
                        </div>
                      </div>
                      <span className="text-[10px] mt-1 opacity-50 font-medium px-1">
                        {msg.role === "user" ? "You" : "Student Assistant"}
                      </span>
                    </div>
                  </div>
                ))}

                {currentUserMessage && (
                  <div className="flex gap-3 flex-row-reverse animate-in fade-in duration-300">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentStyles.userAvatar}`}
                    >
                      <User size={16} />
                    </div>
                    <div className="flex flex-col items-end max-w-[85%] sm:max-w-[80%]">
                      <div
                        style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                        className={`px-4 py-3 rounded-2xl rounded-tr-none shadow-sm italic opacity-80 ${currentStyles.userBubble}`}
                      >
                        {currentUserMessage}...
                      </div>
                    </div>
                  </div>
                )}

                {currentAssistantMessage && (
                  <div className="flex gap-3 flex-row animate-in fade-in duration-300">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentStyles.assistantAvatar}`}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div className="flex flex-col items-start max-w-[85%] sm:max-w-[80%]">
                      <div
                        style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                        className={`px-4 py-3 rounded-2xl rounded-tl-none shadow-sm ${currentStyles.assistantBubble}`}
                      >
                        {currentAssistantMessage}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-[#663820] dark:bg-[#f5a97f] animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && !isVoiceMode && (
                  <div className="flex gap-3 animate-in fade-in duration-300">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentStyles.assistantAvatar}`}
                    >
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                    <div
                      className={`px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3 ${currentStyles.loadingBubble}`}
                    >
                      <div className="flex gap-1">
                        <span
                          className="w-1.5 h-1.5 bg-[#663820] dark:bg-[#f5a97f] opacity-40 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[#663820] dark:bg-[#f5a97f] opacity-60 rounded-full animate-bounce"
                          style={{ animationDelay: "200ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-[#663820] dark:bg-[#f5a97f] opacity-90 rounded-full animate-bounce"
                          style={{ animationDelay: "400ms" }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#663820] dark:text-[#f5a97f] tracking-wider uppercase italic">
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
          <div
            className={`p-3 sm:p-4 border-t transition-colors duration-300 shrink-0 ${currentStyles.footer}`}
          >
            <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
              <div className="relative flex-1 group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity">
                  <Search size={18} />
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
                  className={`w-full pl-10 pr-12 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm focus:outline-none transition-all shadow-inner ${currentStyles.inputField}`}
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 bg-[#663820] text-white rounded-lg sm:rounded-xl hover:bg-[#7a4528] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              {/* Real-time Voice Button */}
              {isVoiceMode && (
                <div className="relative">
                  {isActive && (
                    <div className="absolute inset-0 bg-red-500 rounded-xl sm:rounded-2xl animate-ping opacity-20" />
                  )}
                  <button
                    onClick={isActive ? stopVapi : () => startVapi()}
                    disabled={status === "connecting"}
                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-md z-10 relative ${
                      isActive
                        ? "bg-red-500 text-white"
                        : "bg-[#212a3b] text-white hover:bg-[#3d485e]"
                    }`}
                    title={isActive ? "Stop Voice" : "Start Voice Conversation"}
                  >
                    {status === "connecting" ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : isActive ? (
                      <MicOff size={20} />
                    ) : (
                      <Mic size={20} />
                    )}
                  </button>

                  {/* Mini Waveform */}
                  {isActive && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 h-2.5 justify-center w-10">
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

            <div className="max-w-3xl mx-auto mt-2 flex items-center justify-center gap-3 text-[10px] text-gray-400 font-medium">
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
      </div>
    </div>
  );
};

export default ChatInterface;
