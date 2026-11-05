"use client";

import { useState } from "react";
import { Check, ChevronRight, RotateCcw, Trophy, X } from "lucide-react";

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
}

export default function QuizModal({ quiz, onClose }: QuizModalProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => quiz.questions.map(() => null),
  );
  const [isComplete, setIsComplete] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const question = quiz.questions[questionIndex];
  const selectedAnswer = answers[questionIndex];
  const score = answers.reduce<number>(
    (total, answer, index) =>
      total + (answer === quiz.questions[index]?.correctIndex ? 1 : 0),
    0,
  );
  const percentage = Math.round((score / quiz.questions.length) * 100);

  const chooseAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setAnswers((current) =>
      current.map((answer, index) =>
        index === questionIndex ? answerIndex : answer,
      ),
    );
    setIsFlipped(true);
  };

  const goToNext = () => {
    if (questionIndex === quiz.questions.length - 1) {
      setIsComplete(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setIsFlipped(false);
  };

  const retake = () => {
    setAnswers(quiz.questions.map(() => null));
    setQuestionIndex(0);
    setIsComplete(false);
    setIsFlipped(false);
  };

  const answerStyle = (optionIndex: number) => {
    if (selectedAnswer === null) {
      return "border-slate-200 bg-white text-slate-800 hover:border-[#9b6647] hover:bg-[#fffaf0]";
    }
    if (optionIndex === question.correctIndex) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900";
    }
    if (optionIndex === selectedAnswer) {
      return "border-rose-500 bg-rose-50 text-rose-900";
    }
    return "border-slate-200 bg-white text-slate-500";
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-quiz-title"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#faf8f5] p-5 text-[#212a3b] shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close practice quiz"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900"
        >
          <X size={20} />
        </button>

        <div className="mb-6 pr-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#8b5737]">
            Active Recall Practice
          </p>
          <h2 id="practice-quiz-title" className="font-serif text-2xl font-bold sm:text-3xl">
            {quiz.quizTitle}
          </h2>
        </div>

        {isComplete ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-[#eed8b6] bg-white p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Trophy size={32} />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#8b5737]">
              Quiz complete
            </p>
            <h3 className="mt-2 text-3xl font-extrabold">
              {score}/{quiz.questions.length} ({percentage}%)
            </h3>
            <p className="mt-2 text-slate-600">
              {percentage >= 80
                ? "Great Job!"
                : percentage >= 60
                  ? "Nice work! Keep practicing."
                  : "Keep reviewing — you’ll get there!"}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={retake}
                className="flex items-center gap-2 rounded-xl bg-[#663820] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7a4528]"
              >
                <RotateCcw size={16} />
                Retake quiz
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">
                Question {questionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="rounded-full bg-[#eed8b6] px-3 py-1 text-xs font-bold text-[#663820]">
                {answers.filter((answer) => answer !== null).length} answered
              </span>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#8b5737] transition-all"
                style={{
                  width: `${((questionIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            <div className="min-h-[400px] [perspective:1200px]">
              <div
                className="relative min-h-[400px] w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <section
                  className="absolute inset-0 rounded-2xl border border-[#eed8b6] bg-white p-5 shadow-sm [backface-visibility:hidden] sm:p-7"
                  aria-label={`Question ${questionIndex + 1}`}
                >
                  <h3 className="mb-6 text-lg font-bold leading-relaxed sm:text-xl">
                    {question.question}
                  </h3>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={`${question.id}-${optionIndex}`}
                        type="button"
                        onClick={() => chooseAnswer(optionIndex)}
                        disabled={selectedAnswer !== null}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors sm:p-4 ${answerStyle(optionIndex)}`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="pt-0.5">{option}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-center text-xs text-slate-400">
                    Select an answer to reveal the explanation
                  </p>
                </section>

                <section
                  className="absolute inset-0 flex flex-col rounded-2xl border border-[#eed8b6] bg-white p-5 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-7"
                  aria-label="Answer and explanation"
                  aria-live="polite"
                >
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold">
                    {selectedAnswer === question.correctIndex ? (
                      <>
                        <Check size={18} className="text-emerald-600" />
                        <span className="text-emerald-800">Correct!</span>
                      </>
                    ) : (
                      <span className="text-rose-700">Not quite — review the answer.</span>
                    )}
                  </div>
                  <h3 className="mb-5 text-lg font-bold leading-relaxed sm:text-xl">
                    {question.question}
                  </h3>
                  <div className="space-y-2.5">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={`${question.id}-answer-${optionIndex}`}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${answerStyle(optionIndex)}`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1 pt-0.5">{option}</span>
                        {optionIndex === question.correctIndex && (
                          <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-[#fffaf0] p-4 text-sm leading-relaxed text-slate-700">
                    <p className="mb-1 font-bold text-[#663820]">Why?</p>
                    {question.explanation}
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={goToNext}
                disabled={selectedAnswer === null}
                className="flex items-center gap-2 rounded-xl bg-[#663820] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7a4528] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {questionIndex === quiz.questions.length - 1 ? "See score" : "Next question"}
                {questionIndex === quiz.questions.length - 1 ? (
                  <Trophy size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
