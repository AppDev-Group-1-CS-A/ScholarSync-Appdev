"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  ChevronRight,
  RotateCcw,
  Trophy,
  X,
  Brain,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
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
}

export default function QuizModal({
  quiz,
  onClose,
  theme = "light",
}: QuizModalProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => quiz.questions.map(() => null),
  );
  const [isComplete, setIsComplete] = useState(false);
  const [expandedReviewIndex, setExpandedReviewIndex] = useState<number | null>(null);

  const question = quiz.questions[questionIndex];
  const selectedAnswer = answers[questionIndex];
  const totalQuestions = quiz.questions.length;

  const score = answers.reduce<number>(
    (total, answer, index) =>
      total + (answer === quiz.questions[index]?.correctIndex ? 1 : 0),
    0,
  );
  const percentage = Math.round((score / totalQuestions) * 100);

  const chooseAnswer = useCallback(
    (answerIndex: number) => {
      if (selectedAnswer !== null) return;
      setAnswers((current) =>
        current.map((answer, index) =>
          index === questionIndex ? answerIndex : answer,
        ),
      );
    },
    [selectedAnswer, questionIndex],
  );

  const goToNext = useCallback(() => {
    if (questionIndex === totalQuestions - 1) {
      setIsComplete(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
  }, [questionIndex, totalQuestions]);

  const retake = () => {
    setAnswers(quiz.questions.map(() => null));
    setQuestionIndex(0);
    setIsComplete(false);
    setExpandedReviewIndex(null);
  };

  // Keyboard shortcut navigation (A-D / 1-4 to answer, Enter / Space / ArrowRight for next, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (isComplete) return;

      if (selectedAnswer === null) {
        // Choose option via keyboard
        const key = e.key.toLowerCase();
        if (key === "a" || key === "1") chooseAnswer(0);
        else if (key === "b" || key === "2") chooseAnswer(1);
        else if (key === "c" || key === "3") chooseAnswer(2);
        else if (key === "d" || key === "4") chooseAnswer(3);
      } else {
        // Next question via Enter, Space, or ArrowRight
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          goToNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chooseAnswer, goToNext, isComplete, onClose, selectedAnswer]);

  // Theme palettes
  const modalStyles = {
    light: {
      card: "bg-white border-slate-200 text-slate-900 shadow-2xl",
      headerBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      subtext: "text-slate-500",
      progressBg: "bg-slate-100",
      progressBar: "bg-gradient-to-r from-emerald-500 to-teal-500",
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
      explanationBox:
        "bg-amber-50/70 border-amber-200/80 text-amber-950",
      explanationHeading: "text-amber-800",
      nextBtn:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
      retakeBtn:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
      closeBtn:
        "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      reviewItem: "border-slate-200 bg-slate-50/60 text-slate-800",
    },
    sepia: {
      card: "bg-[#fbf0d9] border-[#debfa4] text-[#433422] shadow-2xl",
      headerBadge: "bg-[#edd9be] text-[#5f4b32] border-[#debfa4]",
      subtext: "text-[#735c40]",
      progressBg: "bg-[#edd9be]/60",
      progressBar: "bg-gradient-to-r from-[#9b6647] to-[#7a4b2a]",
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
      retakeBtn: "bg-[#7a4b2a] hover:bg-[#623b20] text-white shadow-md shadow-[#7a4b2a]/20",
      closeBtn: "border-[#debfa4] bg-[#fbf0d9] text-[#433422] hover:bg-[#f4e5cb]",
      reviewItem: "border-[#debfa4] bg-[#f4e5cb] text-[#433422]",
    },
    dark: {
      card: "bg-[#181825] border-slate-800 text-slate-100 shadow-2xl shadow-black/80",
      headerBadge: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
      subtext: "text-slate-400",
      progressBg: "bg-slate-800",
      progressBar: "bg-gradient-to-r from-emerald-500 to-teal-400",
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
      explanationBox:
        "bg-amber-950/30 border-amber-800/40 text-amber-200",
      explanationHeading: "text-amber-300",
      nextBtn:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50",
      retakeBtn:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50",
      closeBtn: "border-slate-800 bg-[#1e1e2e] text-slate-300 hover:bg-slate-800/60",
      reviewItem: "border-slate-800/80 bg-[#1e1e2e]/70 text-slate-200",
    },
  };

  const currentStyle = modalStyles[theme] || modalStyles.light;

  const getOptionClass = (optionIndex: number) => {
    if (selectedAnswer === null) {
      return currentStyle.optionDefault;
    }
    if (optionIndex === question.correctIndex) {
      return currentStyle.optionCorrect;
    }
    if (optionIndex === selectedAnswer) {
      return currentStyle.optionWrong;
    }
    return currentStyle.optionMuted;
  };

  const getLetterBadgeClass = (optionIndex: number) => {
    if (selectedAnswer === null) {
      return currentStyle.letterBadge;
    }
    if (optionIndex === question.correctIndex) {
      return currentStyle.letterBadgeCorrect;
    }
    if (optionIndex === selectedAnswer) {
      return currentStyle.letterBadgeWrong;
    }
    return currentStyle.letterBadge;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-quiz-title"
    >
      <div
        className={`relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl border p-5 sm:p-8 transition-colors ${currentStyle.card}`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close practice quiz"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-100"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-10">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${currentStyle.headerBadge}`}
            >
              <Brain size={13} />
              Active Recall Quiz
            </span>
            <span className={`text-xs ${currentStyle.subtext}`}>
              • Powered by Groq AI
            </span>
          </div>
          <h2
            id="practice-quiz-title"
            className="text-xl sm:text-2xl font-bold font-serif leading-tight tracking-tight"
          >
            {quiz.quizTitle}
          </h2>
        </div>

        {isComplete ? (
          /* ================= RESULTS & REVIEW SCREEN ================= */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Score Hero Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border p-6 sm:p-8 text-center bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.02]">
              <div className="mb-4 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5 shadow-inner">
                <Trophy size={40} className="animate-bounce" />
                <Sparkles
                  size={18}
                  className="absolute -top-1 -right-1 text-amber-400 animate-spin"
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                Practice Session Complete
              </p>
              <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                {score} / {totalQuestions}{" "}
                <span className="text-2xl sm:text-3xl font-semibold opacity-70">
                  ({percentage}%)
                </span>
              </h3>

              <p className={`mt-2 text-sm sm:text-base font-medium ${currentStyle.subtext}`}>
                {percentage === 100
                  ? "Perfect Score! You have fully mastered these concepts. 🌟"
                  : percentage >= 80
                    ? "Great Job! You have a solid grasp of this textbook material. 🎯"
                    : percentage >= 60
                      ? "Good Effort! Review the missed questions below to reinforce learning. 📚"
                      : "Keep Practicing! Re-reading the key sections will help you master this topic. 💪"}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={retake}
                  className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${currentStyle.retakeBtn}`}
                >
                  <RotateCcw size={16} />
                  Retake Quiz
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-all ${currentStyle.closeBtn}`}
                >
                  Back to Textbook
                </button>
              </div>
            </div>

            {/* Question Breakdown & Explanations Review */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-75">
                Question Review & Explanations
              </h4>

              {quiz.questions.map((q, idx) => {
                const userChoice = answers[idx];
                const isCorrect = userChoice === q.correctIndex;
                const isExpanded = expandedReviewIndex === idx;

                return (
                  <div
                    key={`review-${q.id}`}
                    className={`rounded-xl border transition-all ${currentStyle.reviewItem}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReviewIndex(isExpanded ? null : idx)
                      }
                      className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-500 shrink-0"
                          />
                        ) : (
                          <XCircle
                            size={18}
                            className="text-rose-500 shrink-0"
                          />
                        )}
                        <span className="text-xs sm:text-sm font-semibold line-clamp-1">
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
                        {isExpanded ? (
                          <ChevronUp size={16} className="opacity-50" />
                        ) : (
                          <ChevronDown size={16} className="opacity-50" />
                        )}
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
                                    Correct Answer
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

                        <div
                          className={`rounded-xl p-3 border text-xs leading-relaxed ${currentStyle.explanationBox}`}
                        >
                          <p
                            className={`font-bold mb-1 flex items-center gap-1 ${currentStyle.explanationHeading}`}
                          >
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
          /* ================= ACTIVE QUESTION FLOW ================= */
          <div className="space-y-5">
            {/* Progress Bar & Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold flex items-center gap-1.5">
                  <span>Question {questionIndex + 1} of {totalQuestions}</span>
                  <span className={`text-[11px] font-normal hidden sm:inline ${currentStyle.subtext}`}>
                    (Active Recall)
                  </span>
                </span>
                <span className={`text-xs font-semibold ${currentStyle.subtext}`}>
                  {answers.filter((a) => a !== null).length} answered
                </span>
              </div>

              <div
                className={`h-2.5 w-full overflow-hidden rounded-full ${currentStyle.progressBg}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${currentStyle.progressBar}`}
                  style={{
                    width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div
              className={`rounded-2xl border p-4 sm:p-6 transition-all ${currentStyle.questionBox}`}
            >
              <h3 className="text-base sm:text-lg font-bold leading-relaxed">
                {question.question}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;
                const isCorrect = optionIndex === question.correctIndex;
                const isRevealed = selectedAnswer !== null;

                return (
                  <button
                    key={`${question.id}-${optionIndex}`}
                    type="button"
                    onClick={() => chooseAnswer(optionIndex)}
                    disabled={isRevealed}
                    className={`group flex w-full items-start gap-3 rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 text-left text-xs sm:text-sm font-medium transition-all duration-150 ${getOptionClass(
                      optionIndex,
                    )} ${
                      !isRevealed
                        ? "cursor-pointer active:scale-[0.99]"
                        : "cursor-default"
                    }`}
                  >
                    {/* Letter Badge (A, B, C, D) */}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${getLetterBadgeClass(
                        optionIndex,
                      )}`}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>

                    {/* Option Text */}
                    <span className="flex-1 pt-0.5 leading-snug">{option}</span>

                    {/* Indicator Icon */}
                    {isRevealed && isCorrect && (
                      <Check
                        size={18}
                        className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-in zoom-in-75 duration-200"
                      />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <X
                        size={18}
                        className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-in zoom-in-75 duration-200"
                      />
                    )}

                    {/* Desktop Keyboard Shortcut Badge */}
                    {!isRevealed && (
                      <span className="hidden sm:inline-block text-[10px] font-mono opacity-30 group-hover:opacity-75 uppercase px-1.5 py-0.5 rounded border border-current">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer & Explanation Drawer (Smoothly appears once answered) */}
            {selectedAnswer !== null && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Result Tag Banner */}
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs sm:text-sm font-bold border ${
                    selectedAnswer === question.correctIndex
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {selectedAnswer === question.correctIndex ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Correct! Well done.</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>
                        Incorrect. The correct answer was option{" "}
                        <strong className="underline">
                          {String.fromCharCode(65 + question.correctIndex)}
                        </strong>
                        .
                      </span>
                    </>
                  )}
                </div>

                {/* Explanation Card */}
                <div
                  className={`rounded-2xl border p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${currentStyle.explanationBox}`}
                >
                  <p
                    className={`font-bold mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider ${currentStyle.explanationHeading}`}
                  >
                    <Lightbulb size={14} />
                    Why? (Textbook Concept):
                  </p>
                  <p className="opacity-95">{question.explanation}</p>
                </div>
              </div>
            )}

            {/* Footer Navigation Bar */}
            <div className="flex items-center justify-between pt-2">
              <p className={`text-xs hidden sm:block ${currentStyle.subtext}`}>
                {selectedAnswer === null
                  ? "Tip: Press A, B, C, or D on your keyboard"
                  : "Tip: Press Enter ↵ or Space to continue"}
              </p>

              <button
                type="button"
                onClick={goToNext}
                disabled={selectedAnswer === null}
                className={`ml-auto flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all duration-150 ${
                  currentStyle.nextBtn
                } ${
                  selectedAnswer === null
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer active:scale-95"
                }`}
              >
                <span>
                  {questionIndex === totalQuestions - 1
                    ? "See Results"
                    : "Next Question"}
                </span>
                {questionIndex === totalQuestions - 1 ? (
                  <Trophy size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
