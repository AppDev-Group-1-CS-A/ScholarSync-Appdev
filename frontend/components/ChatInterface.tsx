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
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  MessageSquare,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  chatWithBook,
  clearChatHistory,
  getChatHistory,
} from "@/lib/actions/chat.actions";
import { toast } from "sonner";
import useVapi from "@/hooks/useVapi";
import ReaderAppearanceControls, {
  ReaderTheme,
} from "./ReaderAppearanceControls";
import ReaderStudyPane from "./ReaderStudyPane";

export interface ChatSession {
  id: string;
  title: string;
  messages: Messages[];
  createdAt: number;
  updatedAt: number;
}

const ChatInterface = ({ book }: { book: IBook }) => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Left Sidebar State (Claude style collapsible sidebar + Chat History)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"history" | "study">("history");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState(0);

  // Reader Appearance Controls (FE-01: Light, Sepia & Dark Mode + Font Scaling)
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [fontSize, setFontSize] = useState<number>(16);

  // Load the persisted book thread and refresh the local cache.
  useEffect(() => {
    let cancelled = false;
    setIsHistoryLoading(true);

    const loadHistory = async () => {
      const emptySession: ChatSession = {
        id: `book_${book._id}`,
        title: "New Conversation",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        const result = await getChatHistory(book._id, book.userId);
        if (!result.success) throw new Error(result.error || "Failed to load chat history");

        const records = Array.isArray(result.data) ? result.data : [];
        const historyMessages: Messages[] = records.map(
          (record: { role: string; content: string }) => ({
            role: record.role,
            content: record.content,
          }),
        );
        const firstTimestamp = records[0]?.createdAt
          ? Date.parse(records[0].createdAt)
          : Date.now();
        const lastTimestamp = records.at(-1)?.createdAt
          ? Date.parse(records.at(-1).createdAt)
          : firstTimestamp;
        const firstUserMessage = historyMessages.find(
          (message) => message.role === "user",
        );
        const session: ChatSession = {
          id: `book_${book._id}`,
          title: firstUserMessage?.content.slice(0, 36) || "Book Thread",
          messages: historyMessages,
          createdAt: firstTimestamp,
          updatedAt: lastTimestamp,
        };

        if (cancelled) return;
        setSessions([session]);
        setActiveSessionId(session.id);
        setMessages(historyMessages);
        try {
          localStorage.setItem(
            `scholarsync_chats_${book._id}`,
            JSON.stringify([session]),
          );
        } catch {
          // Ignore local cache failures; the backend remains authoritative.
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to hydrate chat history:", error);
        toast.error("Could not load saved chat history.");
        setSessions([emptySession]);
        setActiveSessionId(emptySession.id);
        setMessages([]);
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [book._id, book.userId]);

  // Responsive sidebar: collapse by default on mobile screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignore
    }
  };

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
      container: "bg-white text-[#212a3b]",
      header: "bg-[#f3e4c7] border-black/10 text-[#212a3b]",
      headerSubtitle: "text-gray-500",
      sidebar: "bg-[#fdfcf9] border-black/10 text-[#212a3b]",
      sidebarHeader: "bg-[#f3e4c7] border-black/10 text-[#212a3b]",
      sidebarFooter: "bg-[#f7f3eb] border-black/10 text-[#212a3b]",
      tabActive: "bg-white text-[#663820] shadow-xs font-bold",
      tabInactive: "text-[#212a3b]/70 hover:text-[#212a3b] hover:bg-black/5",
      sessionActive:
        "bg-[#f3e4c7] text-[#663820] font-bold shadow-xs border border-[#dec8a0]",
      sessionInactive:
        "hover:bg-black/5 text-[#212a3b] border border-transparent",
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
      container: "bg-[#fbf0d9] text-[#433422]",
      header: "bg-[#f0dfbe] border-[#dec8a0] text-[#433422]",
      headerSubtitle: "text-[#663820]",
      sidebar: "bg-[#f8eed8] border-[#dec8a0] text-[#433422]",
      sidebarHeader: "bg-[#eed8b6] border-[#dec8a0] text-[#433422]",
      sidebarFooter: "bg-[#ebd9b8] border-[#dec8a0] text-[#433422]",
      tabActive: "bg-[#fff8ea] text-[#663820] shadow-xs font-bold",
      tabInactive: "text-[#433422]/70 hover:text-[#433422] hover:bg-black/5",
      sessionActive:
        "bg-[#eed8b6] text-[#433422] font-bold shadow-xs border border-[#dec8a0]",
      sessionInactive:
        "hover:bg-black/5 text-[#433422] border border-transparent",
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
      container: "bg-[#181926] text-[#cad3f5]",
      header: "bg-[#1e2030] border-[#363a4f] text-[#cad3f5]",
      headerSubtitle: "text-[#a5adcb]",
      sidebar: "bg-[#141520] border-[#363a4f] text-[#cad3f5]",
      sidebarHeader: "bg-[#1e2030] border-[#363a4f] text-[#cad3f5]",
      sidebarFooter: "bg-[#181926] border-[#363a4f] text-[#cad3f5]",
      tabActive: "bg-[#24273a] text-[#f5a97f] shadow-xs font-bold",
      tabInactive: "text-[#cad3f5]/70 hover:text-[#cad3f5] hover:bg-white/5",
      sessionActive:
        "bg-[#24273a] text-[#f5a97f] font-bold shadow-xs border border-[#363a4f]",
      sessionInactive:
        "hover:bg-white/5 text-[#cad3f5] border border-transparent",
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

  // Session persistence helper
  const persistSessionMessages = (
    updatedMessages: Messages[],
    customTitle?: string,
  ) => {
    setSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
      let nextSessions: ChatSession[];

      if (existingIndex >= 0) {
        const currentSession = prev[existingIndex];
        let newTitle = currentSession.title;
        if (customTitle) {
          newTitle = customTitle;
        } else if (
          (!newTitle || newTitle === "New Conversation") &&
          updatedMessages.length > 0
        ) {
          const firstUserMsg = updatedMessages.find((m) => m.role === "user");
          if (firstUserMsg) {
            newTitle =
              firstUserMsg.content.length > 36
                ? firstUserMsg.content.slice(0, 36).trim() + "..."
                : firstUserMsg.content.trim();
          }
        }

        const updatedSession: ChatSession = {
          ...currentSession,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };

        nextSessions = [...prev];
        nextSessions[existingIndex] = updatedSession;
      } else {
        const newSession: ChatSession = {
          id: activeSessionId || `session_${Date.now()}`,
          title:
            customTitle ||
            (updatedMessages[0]?.content
              ? updatedMessages[0].content.slice(0, 36) + "..."
              : "New Conversation"),
          messages: updatedMessages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        nextSessions = [newSession, ...prev];
      }

      try {
        localStorage.setItem(
          `scholarsync_chats_${book._id}`,
          JSON.stringify(nextSessions),
        );
      } catch {
        // Ignore
      }
      return nextSessions;
    });
  };

  const handleSelectSession = (sessionId: string) => {
    const selected = sessions.find((s) => s.id === sessionId);
    if (selected) {
      setActiveSessionId(sessionId);
      setMessages(selected.messages || []);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    setActiveSessionId(newSession.id);
    setMessages([]);
    try {
      localStorage.setItem(
        `scholarsync_chats_${book._id}`,
        JSON.stringify(nextSessions),
      );
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = (
    e: React.MouseEvent,
    sessionIdToDelete: string,
  ) => {
    e.stopPropagation();
    const nextSessions = sessions.filter((s) => s.id !== sessionIdToDelete);

    if (nextSessions.length === 0) {
      const fallback: ChatSession = {
        id: `session_${Date.now()}`,
        title: "New Conversation",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([fallback]);
      setActiveSessionId(fallback.id);
      setMessages([]);
      try {
        localStorage.setItem(
          `scholarsync_chats_${book._id}`,
          JSON.stringify([fallback]),
        );
      } catch {
        // Ignore
      }
    } else {
      setSessions(nextSessions);
      if (activeSessionId === sessionIdToDelete) {
        setActiveSessionId(nextSessions[0].id);
        setMessages(nextSessions[0].messages || []);
      }
      try {
        localStorage.setItem(
          `scholarsync_chats_${book._id}`,
          JSON.stringify(nextSessions),
        );
      } catch {
        // Ignore
      }
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading || isHistoryLoading || isClearing) return;

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
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    persistSessionMessages(updatedWithUser);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chatWithBook(
        book._id,
        book.userId,
        book.title,
        messageText,
        messages,
      );

      if (result.success && result.data) {
        const assistantMsg: Messages = {
          role: "assistant",
          content: result.data as string,
        };
        const updatedWithAssistant = [...updatedWithUser, assistantMsg];
        setMessages(updatedWithAssistant);
        persistSessionMessages(updatedWithAssistant);
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

  const clearChat = async () => {
    if (!confirm("Clear the saved thread for this book? This cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearChatHistory(book._id, book.userId);
      if (!result.success) throw new Error(result.error || "Failed to clear chat history");

      const emptySession: ChatSession = {
        id: `book_${book._id}`,
        title: "New Conversation",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([emptySession]);
      setActiveSessionId(emptySession.id);
      setMessages([]);
      try {
        localStorage.setItem(
          `scholarsync_chats_${book._id}`,
          JSON.stringify([emptySession]),
        );
      } catch {
        // Ignore local cache failures; the backend remains authoritative.
      }
      if (isActive) stopVapi();
      toast.success("Chat thread cleared.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear chat thread.",
      );
    } finally {
      setIsClearing(false);
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
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    toast.success("Passage quoted to AI Tutor input!");
  };

  const handleAskConcept = (prompt: string) => {
    handleSendMessage(prompt);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const displayMessages = isVoiceMode ? vapiMessages : messages;

  return (
    <div
      data-theme={theme}
      className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${currentStyles.container}`}
    >
      {/* Mobile Backdrop Overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (Claude Style Study Companion) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 h-full transition-all duration-300 ease-in-out border-r flex flex-col shrink-0 ${
          currentStyles.sidebar
        } ${
          isSidebarOpen
            ? "w-[320px] sm:w-[380px] translate-x-0"
            : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none"
        }`}
      >
        {/* Sidebar Header */}
        <div
          className={`px-3.5 py-3 flex items-center justify-between border-b shrink-0 ${currentStyles.sidebarHeader}`}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
            title="Back to Library"
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="text-xs font-bold">Library</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-all"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#663820] hover:bg-[#7a4427] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer group"
          >
            <Plus
              size={15}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sidebar Tabs: Conversations vs Study Guide */}
        <div className="px-3 pb-2 flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              sidebarTab === "history"
                ? currentStyles.tabActive
                : currentStyles.tabInactive
            }`}
          >
            <MessageSquare size={13} />
            <span>History</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
              {sessions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("study")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              sidebarTab === "study"
                ? currentStyles.tabActive
                : currentStyles.tabInactive
            }`}
          >
            <BookOpen size={13} />
            <span>Study Guide</span>
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {sidebarTab === "history" ? (
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                  Recent Conversations
                </span>
                <span className="text-[10px] opacity-50 font-mono">
                  {sessions.length}{" "}
                  {sessions.length === 1 ? "thread" : "threads"}
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-8 px-4 opacity-60">
                  <MessageCircle
                    size={28}
                    className="mx-auto mb-2 opacity-40"
                  />
                  <p className="text-xs font-medium">
                    No saved conversations yet
                  </p>
                  <p className="text-[11px] mt-1 opacity-75">
                    Start a chat or ask a question to begin
                  </p>
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const messageCount = session.messages?.length || 0;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? currentStyles.sessionActive
                          : currentStyles.sessionInactive
                      }`}
                    >
                      <MessageSquare
                        size={15}
                        className={`shrink-0 mt-0.5 ${
                          isActive
                            ? "text-[#663820] dark:text-[#f5a97f]"
                            : "opacity-60 group-hover:opacity-100"
                        }`}
                      />
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-xs font-medium truncate leading-tight">
                          {session.title || "Conversation"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] opacity-60">
                          <Clock size={10} />
                          <span>{formatRelativeTime(session.updatedAt)}</span>
                          <span>•</span>
                          <span>
                            {messageCount}{" "}
                            {messageCount === 1 ? "msg" : "msgs"}
                          </span>
                        </div>
                      </div>

                      {/* Delete Conversation Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="absolute right-2 top-2.5 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-500 transition-all"
                        title="Delete conversation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <ReaderStudyPane
              book={book}
              theme={theme}
              fontSize={fontSize}
              onQuoteToChat={handleQuoteToChat}
              onAskConcept={handleAskConcept}
            />
          )}
        </div>

        {/* Sidebar Footer */}
        <div
          className={`px-4 py-2.5 border-t flex items-center justify-between text-xs shrink-0 ${currentStyles.sidebarFooter}`}
        >
          <button
            type="button"
            onClick={clearChat}
            disabled={isClearing || isHistoryLoading}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded-md transition-colors font-medium"
            title="Clear the saved thread for this book"
          >
            {isClearing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            <span>{isClearing ? "Clearing..." : "Clear Thread"}</span>
          </button>

          <span className="text-[10px] opacity-60 font-mono">
            {isVoiceMode ? "Vapi Voice" : "Groq AI"}
          </span>
        </div>
      </aside>

      {/* Main Full Canvas (Claude-Style Chat Workspace) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Top Header */}
        <header
          className={`px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b shrink-0 transition-colors duration-300 gap-3 ${currentStyles.header}`}
        >
          {/* Left: Sidebar Toggle + Book Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose size={19} />
              ) : (
                <PanelLeftOpen size={19} />
              )}
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-7 relative shadow-sm rounded overflow-hidden hidden sm:block shrink-0 border border-black/10">
                <Image
                  src={book.coverURL || "/assets/book-cover.svg"}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold line-clamp-1">
                  {book.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#663820] dark:text-[#f5a97f] shrink-0">
                    <Sparkles size={10} /> AI Learning Partner
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

          {/* Right Controls: Appearance, Voice Toggle, Fullscreen */}
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
              <span className="hidden sm:inline">
                {isVoiceMode ? "Voice On" : "Voice Off"}
              </span>
            </button>

            {/* Fullscreen Mode Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full transition-all opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </header>

        {/* Reading Progress Tracker (Issue Task 1.2) */}
        <div className="w-full h-[3px] bg-black/5 dark:bg-white/5 relative overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#663820] via-[#c8553d] to-[#d4a853] transition-all duration-150"
            style={{ width: `${Math.max(readingProgress, 4)}%` }}
          />
        </div>

        {/* Chat Message Scroll Area (Centered Claude Stream) */}
        <div
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 scroll-smooth transition-colors duration-300 ${currentStyles.messagesBg}`}
        >
          {displayMessages.length === 0 &&
          !currentAssistantMessage &&
          !currentUserMessage ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
              <div className="bg-[#663820] p-4 sm:p-5 rounded-3xl mb-4 sm:mb-6 shadow-lg rotate-2">
                <GraduationCap size={36} className="text-white" />
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-serif font-bold mb-3 ${currentStyles.emptyHeading}`}
              >
                Hello, Student! I'm your AI Learning Partner.
              </h1>
              <p
                className={`text-sm sm:text-base mb-8 leading-relaxed max-w-md ${currentStyles.emptySubtext}`}
              >
                I've analyzed{" "}
                <span className="font-bold text-[#663820] dark:text-[#f5a97f]">
                  "{book.title}"
                </span>{" "}
                and I'm ready to help you study, summarize, and master the
                material.
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
                    className={`text-xs sm:text-sm mb-6 leading-relaxed opacity-75 ${currentStyles.emptySubtext}`}
                  >
                    {isVoiceMode
                      ? "Voice mode is active. Speak or type to chat."
                      : "Type a question below or choose a study prompt:"}
                  </p>

                  {!isVoiceMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
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
                  className={`flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
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
                      className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-sm leading-relaxed ${
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
                <div className="flex gap-3 sm:gap-4 flex-row-reverse animate-in fade-in duration-300">
                  <div
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentStyles.userAvatar}`}
                  >
                    <User size={16} />
                  </div>
                  <div className="flex flex-col items-end max-w-[85%] sm:max-w-[80%]">
                    <div
                      style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                      className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl rounded-tr-none shadow-sm italic opacity-80 ${currentStyles.userBubble}`}
                    >
                      {currentUserMessage}...
                    </div>
                  </div>
                </div>
              )}

              {currentAssistantMessage && (
                <div className="flex gap-3 sm:gap-4 flex-row animate-in fade-in duration-300">
                  <div
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentStyles.assistantAvatar}`}
                  >
                    <Sparkles size={16} />
                  </div>
                  <div className="flex flex-col items-start max-w-[85%] sm:max-w-[80%]">
                    <div
                      style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                      className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl rounded-tl-none shadow-sm ${currentStyles.assistantBubble}`}
                    >
                      {currentAssistantMessage}
                      <span className="inline-block w-1.5 h-4 ml-1 bg-[#663820] dark:bg-[#f5a97f] animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !isVoiceMode && (
                <div className="flex gap-3 sm:gap-4 animate-in fade-in duration-300">
                  <div
                    className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${currentStyles.assistantAvatar}`}
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

        {/* Floating / Docked Input Bar (Claude Style) */}
        <div
          className={`p-3 sm:p-5 border-t transition-colors duration-300 shrink-0 ${currentStyles.footer}`}
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
                  isHistoryLoading ||
                  isClearing ||
                  (isVoiceMode &&
                    (status === "connecting" || status === "starting"))
                }
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={
                  isLoading ||
                  isHistoryLoading ||
                  isClearing ||
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
      </main>
    </div>
  );
};

export default ChatInterface;
