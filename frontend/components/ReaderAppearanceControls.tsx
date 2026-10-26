"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, BookOpen, RotateCcw, X } from "lucide-react";

export type ReaderTheme = "light" | "sepia" | "dark";

interface ReaderAppearanceControlsProps {
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  fontSize: number;
  onFontSizeChange: (fontSize: number) => void;
}

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 22;
const DEFAULT_FONT_SIZE = 16;
const FONT_STEP = 2;

export default function ReaderAppearanceControls({
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
}: ReaderAppearanceControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDecreaseFont = () => {
    if (fontSize > MIN_FONT_SIZE) {
      onFontSizeChange(Math.max(MIN_FONT_SIZE, fontSize - FONT_STEP));
    }
  };

  const handleIncreaseFont = () => {
    if (fontSize < MAX_FONT_SIZE) {
      onFontSizeChange(Math.min(MAX_FONT_SIZE, fontSize + FONT_STEP));
    }
  };

  const handleReset = () => {
    onThemeChange("light");
    onFontSizeChange(DEFAULT_FONT_SIZE);
  };

  const fontPercentage = Math.round((fontSize / DEFAULT_FONT_SIZE) * 100);

  const themeOptions: {
    id: ReaderTheme;
    label: string;
    description: string;
    icon: typeof Sun;
    bgClass: string;
    borderClass: string;
    textClass: string;
  }[] = [
    {
      id: "light",
      label: "Light",
      description: "Default high contrast",
      icon: Sun,
      bgClass: "bg-white",
      borderClass: "border-black/15",
      textClass: "text-[#212a3b]",
    },
    {
      id: "sepia",
      label: "Sepia",
      description: "Warm paper feel",
      icon: BookOpen,
      bgClass: "bg-[#fbf0d9]",
      borderClass: "border-[#dec8a0]",
      textClass: "text-[#433422]",
    },
    {
      id: "dark",
      label: "Dark",
      description: "Low-light comfort",
      icon: Moon,
      bgClass: "bg-[#181926]",
      borderClass: "border-[#363a4f]",
      textClass: "text-[#cad3f5]",
    },
  ];

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          isOpen
            ? "bg-[#663820] text-white shadow-sm"
            : theme === "dark"
              ? "bg-[#24273a] text-[#cad3f5] hover:bg-[#363a4f] border border-[#363a4f]"
              : theme === "sepia"
                ? "bg-[#f3e4c7] text-[#433422] hover:bg-[#eed8b6] border border-[#dec8a0]"
                : "bg-white/70 text-[#212a3b] hover:bg-white border border-black/10"
        }`}
        title="Reader Appearance Controls (Theme & Font Size)"
        aria-label="Reader Appearance Controls"
        aria-expanded={isOpen}
      >
        <span className="font-serif font-black text-sm tracking-tighter">Aa</span>
        <span className="hidden md:inline">Appearance</span>
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Reader Appearance Settings"
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
            theme === "dark"
              ? "bg-[#1e2030] border-[#363a4f] text-[#cad3f5]"
              : theme === "sepia"
                ? "bg-[#fbf0d9] border-[#dec8a0] text-[#433422]"
                : "bg-white border-black/10 text-[#212a3b]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base">Aa</span>
              <span className="font-bold text-sm">Reading Aesthetics</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Reset to default settings"
              >
                <RotateCcw size={14} className="opacity-70 hover:opacity-100" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={14} className="opacity-70 hover:opacity-100" />
              </button>
            </div>
          </div>

          {/* Theme Mode Selector */}
          <div className="mt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-2">
              Reading Theme
            </span>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onThemeChange(opt.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all relative ${opt.bgClass} ${opt.textClass} ${opt.borderClass} ${
                      isSelected
                        ? "ring-2 ring-[#663820] shadow-md scale-[1.03]"
                        : "hover:scale-[1.01] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Icon size={16} className="mb-1" />
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#663820]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Scaling Section */}
          <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Text Scale
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                {fontPercentage}% ({fontSize}px)
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
              {/* Decrease Font Button */}
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={fontSize <= MIN_FONT_SIZE}
                className="flex items-center justify-center w-10 h-9 rounded-lg bg-white dark:bg-[#24273a] border border-black/10 dark:border-white/10 font-serif font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all shadow-xs"
                title="Decrease font size (A-)"
                aria-label="Decrease font size"
              >
                A-
              </button>

              {/* Step Dots Display */}
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                {[14, 16, 18, 20, 22].map((step) => {
                  const isActive = step === fontSize;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => onFontSizeChange(step)}
                      className={`h-2 rounded-full transition-all ${
                        isActive
                          ? "w-6 bg-[#663820]"
                          : "w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40"
                      }`}
                      title={`${step}px (${Math.round((step / DEFAULT_FONT_SIZE) * 100)}%)`}
                    />
                  );
                })}
              </div>

              {/* Increase Font Button */}
              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={fontSize >= MAX_FONT_SIZE}
                className="flex items-center justify-center w-10 h-9 rounded-lg bg-white dark:bg-[#24273a] border border-black/10 dark:border-white/10 font-serif font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all shadow-xs"
                title="Increase font size (A+)"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
