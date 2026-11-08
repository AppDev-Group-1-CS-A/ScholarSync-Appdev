"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  X,
  Brain,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Repeat,
  Flame,
} from "lucide-react";
import { ReaderTheme } from "./ReaderAppearanceControls";

export interface PracticeQuiz {
  quizTitle: string;
  questions: {
    id: number;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
  }[];
}

interface QuizModalProps {
  quiz: PracticeQuiz;
  onClose: () => void;
  theme?: ReaderTheme;
  initialMode?: "flashcards" | "quiz";
}

export default function QuizModal({
  quiz,
  onClose,
  theme = "light",
  initialMode = "flashcards",
}: QuizModalProps) {
  // Study Mode: Flashcards vs Multiple Choice Quiz
  const [studyMode, setStudyMode] = useState<"flashcards" | "quiz">(initialMode);

  // ================= QUIZ STATE =================
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    () => quiz.questions.map(() => null),
  );
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [expandedReviewIndex, setExpandedReviewIndex] = useState<number | null>(null);

  // ================= FLASHCARD STATE =================
  // Queue of question IDs to study (enables spaced repetition / Leitner recycling)
  const [cardQueue, setCardQueue] = useState<number[]>(
    () => quiz.questions.map((_, idx) => idx),
  );
  const [queuePointer, setQueuePointer] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(() => new Set());
  const [isDeckComplete, setIsDeckComplete] = useState(false);

  const totalCards = quiz.questions.length;
  const currentCardIdx = cardQueue[queuePointer] ?? 0;
  const currentCard = quiz.questions[currentCardIdx];

  // ================= QUIZ LOGIC =================
  const currentQuestion = quiz.questions[quizIndex];
  const selectedAnswer = quizAnswers[quizIndex];

  const quizScore = quizAnswers.reduce<number>(
    (total, answer, index) =>
      total + (answer === quiz.questions[index]?.correctIndex ? 1 : 0),
    0,
  );
  const quizPercentage = Math.round((quizScore / totalCards) * 100);

  const chooseQuizAnswer = useCallback(
    (answerIndex: number) => {
      if (selectedAnswer !== null) return;
      setQuizAnswers((current) =>
        current.map((answer, index) =>
          index === quizIndex ? answerIndex : answer,
        ),
      );
    },
    [selectedAnswer, quizIndex],
  );

  const goToNextQuizQuestion = useCallback(() => {
    if (quizIndex === totalCards - 1) {
      setIsQuizComplete(true);
      return;
    }
    setQuizIndex((current) => current + 1);
  }, [quizIndex, totalCards]);

  const retakeQuiz = () => {
    setQuizAnswers(quiz.questions.map(() => null));
    setQuizIndex(0);
    setIsQuizComplete(false);
    setExpandedReviewIndex(null);
  };

  // ================= FLASHCARD LOGIC =================
  const flipCard = useCallback(() => {
    setIsCardFlipped((prev) => !prev);
  }, []);

  const rateCard = useCallback(
    (rating: "again" | "good" | "mastered") => {
      setIsCardFlipped(false);

      if (rating === "mastered") {
        setMasteredIds((prev) => new Set(prev).add(currentCardIdx));
      }

      // If user rated "again", recycle card to the end of the queue
      if (rating === "again") {
        setCardQueue((prev) => [...prev, currentCardIdx]);
      }

      if (queuePointer + 1 >= cardQueue.length) {
        setIsDeckComplete(true);
      } else {
        setQueuePointer((prev) => prev + 1);
      }
    },
    [currentCardIdx, queuePointer, cardQueue.length],
  );

  const restartDeck = () => {
    setCardQueue(quiz.questions.map((_, idx) => idx));
    setQueuePointer(0);
    setIsCardFlipped(false);
    setMasteredIds(new Set());
    setIsDeckComplete(false);
  };

  // ================= KEYBOARD NAVIGATION =================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // FLASHCARD MODE SHORTCUTS
      if (studyMode === "flashcards") {
        if (isDeckComplete) return;

        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          flipCard();
          return;
        }

        if (isCardFlipped) {
          if (e.key === "1") rateCard("again");
          else if (e.key === "2") rateCard("good");
          else if (e.key === "3") rateCard("mastered");
        } else {
          if (e.key === "ArrowRight") {
            if (queuePointer + 1 < cardQueue.length) {
              setQueuePointer((p) => p + 1);
            }
          } else if (e.key === "ArrowLeft") {
            if (queuePointer > 0) {
              setQueuePointer((p) => p - 1);
            }
          }
        }
        return;
      }

      // QUIZ MODE SHORTCUTS
      if (studyMode === "quiz") {
        if (isQuizComplete) return;

        if (selectedAnswer === null) {
          const key = e.key.toLowerCase();
          if (key === "a" || key === "1") chooseQuizAnswer(0);
          else if (key === "b" || key === "2") chooseQuizAnswer(1);
          else if (key === "c" || key === "3") chooseQuizAnswer(2);
          else if (key === "d" || key === "4") chooseQuizAnswer(3);
        } else {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
            e.preventDefault();
            goToNextQuizQuestion();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    chooseQuizAnswer,
    flipCard,
    goToNextQuizQuestion,
    isCardFlipped,
    isDeckComplete,
    isQuizComplete,
    onClose,
    queuePointer,
    cardQueue.length,
    rateCard,
    selectedAnswer,
    studyMode,
  ]);

  // Theme palettes
  const modalStyles = {
    light: {
      card: "bg-white border-slate-200 text-slate-900 shadow-2xl",
      headerBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      subtext: "text-slate-500",
      progressBg: "bg-slate-100",
      progressBar: "bg-gradient-to-r from-emerald-500 to-teal-500",
      modeActive: "bg-white text-emerald-800 shadow-xs font-bold",
      modeInactive: "text-slate-600 hover:text-slate-900 hover:bg-black/5",
      flashcardFront:
        "bg-gradient-to-br from-slate-50 via-white to-slate-50 border-slate-200/90 text-slate-900 shadow-sm",
      flashcardBack:
        "bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 border-emerald-200 text-slate-900 shadow-sm",
      questionBox: "bg-slate-50/80 border-slate-200/80 text-slate-900",
      optionDefault:
        "border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-sm",
      optionCorrect:
        "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20",
      optionWrong:
        "border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-400/20",
      optionMuted: "border-slate-200/60 bg-slate-50/50 text-slate-400 opacity-60",
      letterBadge: "bg-slate-100 text-slate-600",
      letterBadgeCorrect: "bg-emerald-600 text-white",
      letterBadgeWrong: "bg-rose-500 text-white",
      explanationBox: "bg-amber-50/70 border-amber-200/80 text-amber-950",
      explanationHeading: "text-amber-800",
      actionBtn:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
      closeBtn: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      reviewItem: "border-slate-200 bg-slate-50/60 text-slate-800",
    },
    sepia: {
      card: "bg-[#fbf0d9] border-[#debfa4] text-[#433422] shadow-2xl",
      headerBadge: "bg-[#edd9be] text-[#5f4b32] border-[#debfa4]",
      subtext: "text-[#735c40]",
      progressBg: "bg-[#edd9be]/60",
      progressBar: "bg-gradient-to-r from-[#9b6647] to-[#7a4b2a]",
      modeActive: "bg-[#f4e5cb] text-[#433422] shadow-xs font-bold",
      modeInactive: "text-[#735c40] hover:text-[#433422] hover:bg-black/5",
      flashcardFront:
        "bg-gradient-to-br from-[#fbf0d9] via-[#f7ebd4] to-[#f4e5cb] border-[#debfa4] text-[#433422] shadow-sm",
      flashcardBack:
        "bg-gradient-to-br from-[#f5ead2] via-[#fbf0d9] to-[#edd9be] border-[#debfa4] text-[#433422] shadow-sm",
      questionBox: "bg-[#f4e5cb] border-[#debfa4] text-[#433422]",
      optionDefault:
        "border-[#debfa4] bg-[#fbf0d9] text-[#433422] hover:border-[#9b6647] hover:bg-[#f4e5cb]",
      optionCorrect:
        "border-emerald-600 bg-emerald-100/70 text-emerald-950 ring-2 ring-emerald-600/20",
      optionWrong:
        "border-rose-500 bg-rose-100/70 text-rose-950 ring-2 ring-rose-500/20",
      optionMuted: "border-[#debfa4]/60 bg-[#edd9be]/30 text-[#8c7457] opacity-60",
      letterBadge: "bg-[#edd9be] text-[#5f4b32]",
      letterBadgeCorrect: "bg-emerald-700 text-white",
      letterBadgeWrong: "bg-rose-600 text-white",
      explanationBox: "bg-[#edd9be]/80 border-[#debfa4] text-[#433422]",
      explanationHeading: "text-[#7a4b2a]",
      nextBtn: "bg-[#7a4b2a] hover:bg-[#623b20] text-white shadow-md shadow-[#7a4b2a]/20",
      actionBtn: "bg-[#7a4b2a] hover:bg-[#623b20] text-white shadow-md shadow-[#7a4b2a]/20",
      closeBtn: "border-[#debfa4] bg-[#fbf0d9] text-[#433422] hover:bg-[#f4e5cb]",
      reviewItem: "border-[#debfa4] bg-[#f4e5cb] text-[#433422]",
    },
    dark: {
      card: "bg-[#181825] border-slate-800 text-slate-100 shadow-2xl shadow-black/80",
      headerBadge: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
      subtext: "text-slate-400",
      progressBg: "bg-slate-800",
      progressBar: "bg-gradient-to-r from-emerald-500 to-teal-400",
      modeActive: "bg-[#24273a] text-emerald-400 shadow-xs font-bold",
      modeInactive: "text-slate-400 hover:text-slate-100 hover:bg-white/5",
      flashcardFront:
        "bg-gradient-to-br from-[#1e1e2e] via-[#1a1b26] to-[#161622] border-slate-800 text-slate-100 shadow-sm",
      flashcardBack:
        "bg-gradient-to-br from-[#1b262c]/60 via-[#1e1e2e] to-[#142328]/40 border-emerald-900/40 text-slate-100 shadow-sm",
      questionBox: "bg-[#1e1e2e] border-slate-800 text-slate-100",
      optionDefault:
        "border-slate-800 bg-[#1e1e2e] text-slate-200 hover:border-emerald-500/70 hover:bg-emerald-950/20 hover:text-white",
      optionCorrect:
        "border-emerald-500/80 bg-emerald-950/50 text-emerald-200 ring-2 ring-emerald-500/30",
      optionWrong:
        "border-rose-500/80 bg-rose-950/50 text-rose-200 ring-2 ring-rose-500/30",
      optionMuted: "border-slate-800/50 bg-[#14141e] text-slate-500 opacity-40",
      letterBadge: "bg-slate-800 text-slate-300",
      letterBadgeCorrect: "bg-emerald-500 text-slate-950",
      letterBadgeWrong: "bg-rose-500 text-white",
      explanationBox: "bg-amber-950/30 border-amber-800/40 text-amber-200",
      explanationHeading: "text-amber-300",
      actionBtn:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50",
      closeBtn: "border-slate-800 bg-[#1e1e2e] text-slate-300 hover:bg-slate-800/60",
      reviewItem: "border-slate-800/80 bg-[#1e1e2e]/70 text-slate-200",
    },
  };

  const currentStyle = modalStyles[theme] || modalStyles.light;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="active-recall-studio-title"
    >
      <div
        className={`relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl border p-5 sm:p-8 transition-colors ${currentStyle.card}`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close active recall studio"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-100"
        >
          <X size={20} />
        </button>

        {/* Modal Header & Mode Switcher */}
        <div className="mb-6 pr-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${currentStyle.headerBadge}`}
              >
                <Brain size={13} />
                Active Recall Studio
              </span>
              <span className={`text-xs ${currentStyle.subtext}`}>
                • Groq AI
              </span>
            </div>

            {/* Segmented Mode Control: Flashcards vs Practice Quiz */}
            <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setStudyMode("flashcards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  studyMode === "flashcards"
                    ? currentStyle.modeActive
                    : currentStyle.modeInactive
                }`}
              >
                <Layers size={13} />
                <span>Flashcards</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 font-bold">
                  {totalCards}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode("quiz")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  studyMode === "quiz"
                    ? currentStyle.modeActive
                    : currentStyle.modeInactive
                }`}
              >
                <Sparkles size={13} />
                <span>Practice Quiz</span>
              </button>
            </div>
          </div>

          <h2
            id="active-recall-studio-title"
            className="text-xl sm:text-2xl font-bold font-serif leading-tight tracking-tight"
          >
            {quiz.quizTitle}
          </h2>
        </div>

        {/* ========================================================================= */}
        {/* ======================= MODE 1: INTERACTIVE FLASHCARDS ================== */}
        {/* ========================================================================= */}
        {studyMode === "flashcards" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {isDeckComplete ? (
              /* Flashcard Session Complete */
              <div className="flex flex-col items-center justify-center rounded-2xl border p-6 sm:p-8 text-center bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.02] space-y-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5 shadow-inner">
                  <Flame size={40} className="text-emerald-500 animate-pulse" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                    Flashcard Session Complete
                  </p>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {masteredIds.size} / {totalCards} Concepts Mastered
                  </h3>
                  <p className={`mt-2 text-xs sm:text-sm max-w-md mx-auto ${currentStyle.subtext}`}>
                    Great active recall session! You reviewed all {totalCards} key
                    terms and definitions from this chapter.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setStudyMode("quiz");
                      setQuizIndex(0);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${currentStyle.actionBtn}`}
                  >
                    <Sparkles size={16} />
                    Test with Practice Quiz
                  </button>

                  <button
                    type="button"
                    onClick={restartDeck}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs sm:text-sm font-bold transition-all ${currentStyle.closeBtn}`}
                  >
                    <RotateCcw size={15} />
                    Study Deck Again
                  </button>
                </div>
              </div>
            ) : (
              /* Active Flashcard Carousel */
              <div className="space-y-4">
                {/* Deck Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>Card {queuePointer + 1} of {cardQueue.length}</span>
                      <span className={`text-[11px] font-normal hidden sm:inline ${currentStyle.subtext}`}>
                        ({masteredIds.size} mastered)
                      </span>
                    </span>
                    <span className="text-[11px] font-mono opacity-60">
                      Press [Space] to flip
                    </span>
                  </div>

                  <div className={`h-2 w-full overflow-hidden rounded-full ${currentStyle.progressBg}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${currentStyle.progressBar}`}
                      style={{
                        width: `${((queuePointer + 1) / cardQueue.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* The Interactive Flashcard Surface */}
                <div
                  onClick={flipCard}
                  className={`group relative min-h-[280px] sm:min-h-[320px] rounded-2xl sm:rounded-3xl border p-6 sm:p-8 cursor-pointer select-none transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                    isCardFlipped
                      ? currentStyle.flashcardBack
                      : currentStyle.flashcardFront
                  }`}
                >
                  {/* Card Top Pill */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider opacity-60">
                      <Layers size={13} />
                      {isCardFlipped ? "Answer & Definition" : "Concept & Prompt"}
                    </span>
                    <span className="text-[11px] font-semibold opacity-50 flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                      <Repeat size={12} />
                      Flip Card
                    </span>
                  </div>

                  {/* Card Content Area */}
                  <div className="my-auto py-4">
                    {!isCardFlipped ? (
                      /* FRONT: The Question / Prompt */
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Active Recall Prompt:
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold leading-relaxed">
                          {currentCard.question}
                        </h3>
                      </div>
                    ) : (
                      /* BACK: Direct Correct Answer + Explanation */
                      <div className="space-y-4 animate-in fade-in duration-150">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Key Term / Correct Answer:
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold text-emerald-800 dark:text-emerald-300 leading-snug mt-1">
                            {currentCard.options[currentCard.correctIndex]}
                          </h3>
                        </div>

                        <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${currentStyle.explanationBox}`}>
                          <p className={`font-bold mb-1 flex items-center gap-1.5 text-xs ${currentStyle.explanationHeading}`}>
                            <Lightbulb size={13} />
                            Textbook Context:
                          </p>
                          <p className="opacity-95">{currentCard.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Hint */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] opacity-60">
                    <span>
                      {!isCardFlipped
                        ? "Tap card to reveal answer"
                        : "Rate your recall confidence below"}
                    </span>
                    <span className="font-mono hidden sm:inline">
                      [!Space to Flip]
                    </span>
                  </div>
                </div>

                {/* Confidence Self-Rating Controls (Shown when card is flipped) */}
                {isCardFlipped ? (
                  <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <p className={`text-center text-xs font-bold uppercase tracking-wider ${currentStyle.subtext}`}>
                      How well did you know this?
                    </p>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => rateCard("again")}
                        className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 hover:bg-rose-100 transition-all font-bold text-xs"
                      >
                        <span>🔴 Still Learning</span>
                        <span className="text-[10px] opacity-60 font-mono mt-0.5">[Key 1]</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => rateCard("good")}
                        className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-all font-bold text-xs"
                      >
                        <span>🟡 Almost</span>
                        <span className="text-[10px] opacity-60 font-mono mt-0.5">[Key 2]</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => rateCard("mastered")}
                        className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-all font-bold text-xs"
                      >
                        <span>🟢 Mastered</span>
                        <span className="text-[10px] opacity-60 font-mono mt-0.5">[Key 3]</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Card Carousel Arrows */
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => queuePointer > 0 && setQueuePointer((p) => p - 1)}
                      disabled={queuePointer === 0}
                      className="flex items-center gap-1 opacity-70 hover:opacity-100 disabled:opacity-30 p-2 font-semibold transition-opacity"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={flipCard}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Reveal Answer ↵
                    </button>

                    <button
                      type="button"
                      onClick={() => queuePointer + 1 < cardQueue.length && setQueuePointer((p) => p + 1)}
                      disabled={queuePointer + 1 >= cardQueue.length}
                      className="flex items-center gap-1 opacity-70 hover:opacity-100 disabled:opacity-30 p-2 font-semibold transition-opacity"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ======================= MODE 2: MULTIPLE CHOICE QUIZ ==================== */}
        {/* ========================================================================= */}
        {studyMode === "quiz" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {isQuizComplete ? (
              /* Quiz Results & Review Screen */
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center justify-center rounded-2xl border p-6 sm:p-8 text-center bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.02]">
                  <div className="mb-4 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5 shadow-inner">
                    <Trophy size={40} className="animate-bounce" />
                    <Sparkles size={18} className="absolute -top-1 -right-1 text-amber-400 animate-spin" />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                    Quiz Practice Complete
                  </p>
                  <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {quizScore} / {totalCards}{" "}
                    <span className="text-2xl sm:text-3xl font-semibold opacity-70">
                      ({quizPercentage}%)
                    </span>
                  </h3>

                  <p className={`mt-2 text-sm sm:text-base font-medium ${currentStyle.subtext}`}>
                    {quizPercentage === 100
                      ? "Perfect Score! You have fully mastered these concepts. 🌟"
                      : quizPercentage >= 80
                        ? "Great Job! You have a solid grasp of this material. 🎯"
                        : quizPercentage >= 60
                          ? "Good Effort! Review the missed questions below to reinforce learning. 📚"
                          : "Keep Practicing! Re-reading key sections will help you master this topic. 💪"}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={retakeQuiz}
                      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${currentStyle.actionBtn}`}
                    >
                      <RotateCcw size={15} />
                      Retake Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudyMode("flashcards")}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs sm:text-sm font-bold transition-all ${currentStyle.closeBtn}`}
                    >
                      <Layers size={15} />
                      Study with Flashcards
                    </button>
                  </div>
                </div>

                {/* Question Review List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
                    Question Review & Explanations
                  </h4>

                  {quiz.questions.map((q, idx) => {
                    const userChoice = quizAnswers[idx];
                    const isCorrect = userChoice === q.correctIndex;
                    const isExpanded = expandedReviewIndex === idx;

                    return (
                      <div
                        key={`review-${q.id}`}
                        className={`rounded-xl border transition-all ${currentStyle.reviewItem}`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedReviewIndex(isExpanded ? null : idx)}
                          className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isCorrect ? (
                              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle size={18} className="text-rose-500 shrink-0" />
                            )}
                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {idx + 1}. {q.question}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                isCorrect
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isCorrect ? "Correct" : "Missed"}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 pt-1 sm:p-5 sm:pt-2 border-t border-black/5 dark:border-white/5 space-y-3 text-xs sm:text-sm">
                            <p className="font-medium opacity-90">{q.question}</p>
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIdx) => {
                                const isOptCorrect = optIdx === q.correctIndex;
                                const isOptUser = optIdx === userChoice;

                                return (
                                  <div
                                    key={`review-opt-${optIdx}`}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                                      isOptCorrect
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                                        : isOptUser
                                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through opacity-70"
                                          : "opacity-60"
                                    }`}
                                  >
                                    <span className="w-5 text-center font-bold">
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <span>{opt}</span>
                                    {isOptCorrect && (
                                      <span className="ml-auto text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                                        Correct
                                      </span>
                                    )}
                                    {isOptUser && !isOptCorrect && (
                                      <span className="ml-auto text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded font-bold">
                                        Your Choice
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className={`rounded-xl p-3 border text-xs leading-relaxed ${currentStyle.explanationBox}`}>
                              <p className={`font-bold mb-1 flex items-center gap-1 ${currentStyle.explanationHeading}`}>
                                <Lightbulb size={13} />
                                Key Concept & Explanation:
                              </p>
                              {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Active Multiple Choice Question */
              <div className="space-y-5">
                {/* Progress Bar & Counter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>Question {quizIndex + 1} of {totalCards}</span>
                      <span className={`text-[11px] font-normal hidden sm:inline ${currentStyle.subtext}`}>
                        (Multiple Choice)
                      </span>
                    </span>
                    <span className={`text-xs font-semibold ${currentStyle.subtext}`}>
                      {quizAnswers.filter((a) => a !== null).length} answered
                    </span>
                  </div>

                  <div className={`h-2.5 w-full overflow-hidden rounded-full ${currentStyle.progressBg}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${currentStyle.progressBar}`}
                      style={{
                        width: `${((quizIndex + 1) / totalCards) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Box */}
                <div className={`rounded-2xl border p-4 sm:p-6 transition-all ${currentStyle.questionBox}`}>
                  <h3 className="text-base sm:text-lg font-bold leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswer === optionIndex;
                    const isCorrect = optionIndex === currentQuestion.correctIndex;
                    const isRevealed = selectedAnswer !== null;

                    let optClass = currentStyle.optionDefault;
                    let letterClass = currentStyle.letterBadge;

                    if (isRevealed) {
                      if (isCorrect) {
                        optClass = currentStyle.optionCorrect;
                        letterClass = currentStyle.letterBadgeCorrect;
                      } else if (isSelected) {
                        optClass = currentStyle.optionWrong;
                        letterClass = currentStyle.letterBadgeWrong;
                      } else {
                        optClass = currentStyle.optionMuted;
                      }
                    }

                    return (
                      <button
                        key={`${currentQuestion.id}-${optionIndex}`}
                        type="button"
                        onClick={() => chooseQuizAnswer(optionIndex)}
                        disabled={isRevealed}
                        className={`group flex w-full items-start gap-3 rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 text-left text-xs sm:text-sm font-medium transition-all duration-150 ${optClass}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${letterClass}`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1 pt-0.5 leading-snug">{option}</span>
                        {isRevealed && isCorrect && <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
                        {isRevealed && isSelected && !isCorrect && <X size={18} className="text-rose-500 shrink-0 mt-0.5" />}
                        {!isRevealed && (
                          <span className="hidden sm:inline-block text-[10px] font-mono opacity-30 group-hover:opacity-75 uppercase px-1.5 py-0.5 rounded border border-current">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Drawer */}
                {selectedAnswer !== null && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div
                      className={`flex items-center gap-2 rounded-xl p-3 text-xs sm:text-sm font-bold border ${
                        selectedAnswer === currentQuestion.correctIndex
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {selectedAnswer === currentQuestion.correctIndex ? (
                        <>
                          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Correct! Well done.</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>
                            Incorrect. Correct answer was option{" "}
                            <strong>{String.fromCharCode(65 + currentQuestion.correctIndex)}</strong>.
                          </span>
                        </>
                      )}
                    </div>

                    <div className={`rounded-2xl border p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${currentStyle.explanationBox}`}>
                      <p className={`font-bold mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider ${currentStyle.explanationHeading}`}>
                        <Lightbulb size={14} />
                        Why? (Textbook Concept):
                      </p>
                      <p className="opacity-95">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <p className={`text-xs hidden sm:block ${currentStyle.subtext}`}>
                    {selectedAnswer === null
                      ? "Tip: Press A, B, C, or D on your keyboard"
                      : "Tip: Press Enter ↵ or Space to continue"}
                  </p>

                  <button
                    type="button"
                    onClick={goToNextQuizQuestion}
                    disabled={selectedAnswer === null}
                    className={`ml-auto flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all duration-150 ${
                      currentStyle.actionBtn
                    } ${
                      selectedAnswer === null
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer active:scale-95"
                    }`}
                  >
                    <span>
                      {quizIndex === totalCards - 1 ? "See Results" : "Next Question"}
                    </span>
                    {quizIndex === totalCards - 1 ? <Trophy size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
