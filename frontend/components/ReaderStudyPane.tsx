"use client";

import { useState, useEffect } from "react";
import { IBook } from "@/types";
import { ReaderTheme } from "./ReaderAppearanceControls";
import { getBookSummary } from "@/lib/actions/chat.actions";
import { searchBookSegments } from "@/lib/actions/book.actions";
import {
  BookOpen,
  Sparkles,
  FileText,
  Search,
  Loader2,
  Quote,
  MessageSquarePlus,
  RefreshCw,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ReaderStudyPaneProps {
  book: IBook;
  theme: ReaderTheme;
  fontSize: number;
  onQuoteToChat?: (text: string) => void;
  onAskConcept?: (concept: string) => void;
}

export default function ReaderStudyPane({
  book,
  theme,
  fontSize,
  onQuoteToChat,
  onAskConcept,
}: ReaderStudyPaneProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "segments" | "info">(
    "summary"
  );

  // Summary State
  const [summary, setSummary] = useState<string>("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // Segments State
  const [segments, setSegments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSegmentsLoading, setIsSegmentsLoading] = useState(false);

  // Fetch initial summary from cache or storage if available
  useEffect(() => {
    try {
      const cacheKey = `scholarsync_summary_${book._id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSummary(cached);
        setSummaryLoaded(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [book._id]);

  // Load Book Segments when tab is opened
  useEffect(() => {
    if (activeTab === "segments" && segments.length === 0) {
      loadSegments("");
    }
  }, [activeTab]);

  const loadSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const res = await getBookSummary(book._id, book.title);
      if (res.success && res.data) {
        setSummary(res.data);
        setSummaryLoaded(true);
        try {
          localStorage.setItem(`scholarsync_summary_${book._id}`, res.data);
        } catch {
          // Ignore
        }
        toast.success("AI Chapter Summary generated successfully!");
      } else {
        toast.error(res.error || "Failed to generate summary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to AI summary service");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const loadSegments = async (query: string) => {
    setIsSegmentsLoading(true);
    try {
      const res = await searchBookSegments(book._id, query, 15);
      if (res.success && Array.isArray(res.data)) {
        setSegments(res.data);
      }
    } catch (err) {
      console.error("Error searching segments:", err);
    } finally {
      setIsSegmentsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSegments(searchQuery);
  };

  // Theme-aware styles for the Study Pane
  const themeStyles = {
    light: {
      header: "bg-[#f3e4c7] border-black/10 text-[#212a3b]",
      tabActive: "bg-white text-[#663820] shadow-xs font-bold",
      tabInactive: "text-[#212a3b]/70 hover:text-[#212a3b] hover:bg-black/5",
      body: "bg-[#faf8f5] text-[#212a3b]",
      card: "bg-white border-black/10 shadow-xs",
      cardAccent: "bg-[#fffaf0] border-[#eed8b6]",
      quoteBtn: "hover:bg-[#f3e4c7] text-[#663820]",
      termPill: "bg-[#f3e4c7] text-[#663820]",
      badge: "bg-black/5 text-gray-600",
    },
    sepia: {
      header: "bg-[#eed8b6] border-[#dec8a0] text-[#433422]",
      tabActive: "bg-[#fff8ea] text-[#663820] shadow-xs font-bold",
      tabInactive: "text-[#433422]/70 hover:text-[#433422] hover:bg-black/5",
      body: "bg-[#f5ead2] text-[#433422]",
      card: "bg-[#fff8ea] border-[#dec8a0] shadow-xs",
      cardAccent: "bg-[#fef4e0] border-[#dec8a0]",
      quoteBtn: "hover:bg-[#eed8b6] text-[#663820]",
      termPill: "bg-[#eed8b6] text-[#663820]",
      badge: "bg-[#e8d5b5] text-[#5c4731]",
    },
    dark: {
      header: "bg-[#181926] border-[#363a4f] text-[#cad3f5]",
      tabActive: "bg-[#24273a] text-[#f5a97f] shadow-xs font-bold",
      tabInactive: "text-[#cad3f5]/70 hover:text-[#cad3f5] hover:bg-white/5",
      body: "bg-[#141520] text-[#cad3f5]",
      card: "bg-[#1e2030] border-[#363a4f] shadow-xs",
      cardAccent: "bg-[#24273a] border-[#363a4f]",
      quoteBtn: "hover:bg-[#363a4f] text-[#f5a97f]",
      termPill: "bg-[#363a4f] text-[#f5a97f]",
      badge: "bg-[#24273a] text-[#a5adcb]",
    },
  };

  const currentStyles = themeStyles[theme];

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-colors duration-300 ${currentStyles.body}`}
    >
      {/* Pane Tabs Header */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b transition-colors duration-300 shrink-0 ${currentStyles.header}`}
      >
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeTab === "summary"
                ? currentStyles.tabActive
                : currentStyles.tabInactive
            }`}
          >
            <Sparkles size={14} className="text-[#663820] dark:text-[#f5a97f]" />
            <span>AI Study Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("segments")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeTab === "segments"
                ? currentStyles.tabActive
                : currentStyles.tabInactive
            }`}
          >
            <BookOpen size={14} />
            <span>Book Excerpts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeTab === "info"
                ? currentStyles.tabActive
                : currentStyles.tabInactive
            }`}
          >
            <FileText size={14} />
            <span>Details</span>
          </button>
        </div>

        {activeTab === "summary" && summaryLoaded && (
          <button
            type="button"
            onClick={loadSummary}
            disabled={isSummaryLoading}
            className="flex items-center gap-1 text-[11px] font-bold opacity-70 hover:opacity-100 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            title="Regenerate summary with AI"
          >
            <RefreshCw
              size={12}
              className={isSummaryLoading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Pane Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* ================= TAB 1: AI STUDY GUIDE ================= */}
        {activeTab === "summary" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {!summaryLoaded && !isSummaryLoading && (
              <div
                className={`p-8 rounded-2xl text-center border flex flex-col items-center justify-center space-y-4 ${currentStyles.card}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#663820] text-white flex items-center justify-center shadow-lg">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg mb-1">
                    AI Chapter & Concept Summary
                  </h3>
                  <p className="text-xs opacity-75 max-w-sm mx-auto leading-relaxed">
                    Generate an instant academic study sheet with core concepts,
                    key takeaways, and exam definitions powered by Groq AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSummary}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#663820] text-white text-sm font-bold shadow-md hover:bg-[#7a4528] hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles size={16} />
                  <span>Generate Study Summary</span>
                </button>
              </div>
            )}

            {isSummaryLoading && (
              <div
                className={`p-12 rounded-2xl text-center border flex flex-col items-center justify-center space-y-4 ${currentStyles.card}`}
              >
                <Loader2 size={32} className="animate-spin text-[#663820] dark:text-[#f5a97f]" />
                <h4 className="font-bold text-sm">
                  Analyzing textbook segments with Groq...
                </h4>
                <p className="text-xs opacity-60">
                  Extracting key definitions and bullet takeaways
                </p>
              </div>
            )}

            {summaryLoaded && !isSummaryLoading && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${currentStyles.cardAccent}`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold">
                      Study Summary for: <strong>{book.title}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#663820] text-white shrink-0">
                    AI Generated
                  </span>
                </div>

                <div
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                  className={`p-6 rounded-2xl border leading-relaxed prose prose-sm max-w-none prose-headings:font-serif prose-headings:font-bold prose-h3:text-base prose-strong:text-[#663820] dark:prose-strong:text-[#f5a97f] ${currentStyles.card}`}
                >
                  <div className="whitespace-pre-wrap">{summary}</div>
                </div>

                {onAskConcept && (
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${currentStyles.card}`}
                  >
                    <span className="opacity-75">
                      Want to dive deeper into any concept?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onAskConcept(
                          `Can you give me practice quiz questions based on the summary of ${book.title}?`
                        )
                      }
                      className="flex items-center gap-1 font-bold text-[#663820] dark:text-[#f5a97f] hover:underline"
                    >
                      <MessageSquarePlus size={14} />
                      <span>Quiz Me on This</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: BOOK EXCERPTS & SEGMENTS ================= */}
        {activeTab === "segments" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, keywords, or topics..."
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#663820] ${currentStyles.card}`}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#663820] text-white text-xs font-bold hover:bg-[#7a4528] transition-colors"
              >
                Search
              </button>
            </form>

            {isSegmentsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-[#663820]" />
                <span className="text-xs opacity-60">
                  Retrieving indexed book pages...
                </span>
              </div>
            ) : segments.length === 0 ? (
              <div
                className={`p-8 rounded-2xl text-center border ${currentStyles.card}`}
              >
                <HelpCircle size={24} className="mx-auto mb-2 opacity-40" />
                <h4 className="font-bold text-sm mb-1">No Segments Found</h4>
                <p className="text-xs opacity-60 max-w-xs mx-auto">
                  Try searching for another keyword or check if the book has
                  finished indexing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((seg, idx) => (
                  <div
                    key={seg._id || idx}
                    className={`p-4 rounded-xl border transition-all hover:shadow-sm ${currentStyles.card}`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5 text-[11px] opacity-70">
                      <span className="font-semibold">
                        Page {seg.pageNumber || Math.floor((seg.segmentIndex || idx) / 2) + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{seg.wordCount || 100} words</span>
                        {onQuoteToChat && (
                          <button
                            type="button"
                            onClick={() => onQuoteToChat(seg.content)}
                            className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition-colors ${currentStyles.quoteBtn}`}
                            title="Quote this passage to AI Tutor"
                          >
                            <Quote size={12} />
                            <span>Ask AI</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p
                      style={{ fontSize: `${Math.max(13, fontSize - 1)}px` }}
                      className="leading-relaxed whitespace-pre-wrap"
                    >
                      {seg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: BOOK DETAILS & METRICS ================= */}
        {activeTab === "info" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className={`p-6 rounded-2xl border ${currentStyles.card}`}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-24 h-36 relative rounded-lg overflow-hidden shadow-md shrink-0 border border-black/10">
                  <Image
                    src={book.coverURL || "/assets/book-cover.svg"}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#663820] dark:text-[#f5a97f]">
                      Textbook Document
                    </span>
                    <h3 className="font-serif font-bold text-xl leading-tight mt-1">
                      {book.title}
                    </h3>
                    <p className="text-sm opacity-70 mt-0.5">
                      By {book.author || "Academic Author"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    <div className={`p-2.5 rounded-xl ${currentStyles.badge}`}>
                      <span className="text-[10px] uppercase block opacity-60">
                        Indexed Segments
                      </span>
                      <span className="font-bold text-sm">
                        {book.totalSegments || 0}
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl ${currentStyles.badge}`}>
                      <span className="text-[10px] uppercase block opacity-60">
                        File Size
                      </span>
                      <span className="font-bold text-sm">
                        {book.fileSize
                          ? `${(book.fileSize / 1024 / 1024).toFixed(1)} MB`
                          : "1.2 MB"}
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl ${currentStyles.badge}`}>
                      <span className="text-[10px] uppercase block opacity-60">
                        AI Tutor Mode
                      </span>
                      <span className="font-bold text-sm capitalize">
                        {book.persona || "Academic"}
                      </span>
                    </div>
                  </div>

                  {book.fileURL && (
                    <div className="pt-2">
                      <a
                        href={book.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#663820] dark:text-[#f5a97f] hover:underline"
                      >
                        <ExternalLink size={14} />
                        <span>Open Source Document (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
