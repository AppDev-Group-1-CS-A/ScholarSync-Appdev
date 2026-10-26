"use client";

import { MoonStar, NotebookPen, Plus, SunMedium, Minus } from "lucide-react";

export type ReaderTheme = "light" | "sepia" | "dark";

const themeButtonConfig: Array<{
  value: ReaderTheme;
  label: string;
  icon: typeof SunMedium;
}> = [
  { value: "light", label: "Light", icon: SunMedium },
  { value: "sepia", label: "Sepia", icon: NotebookPen },
  { value: "dark", label: "Dark", icon: MoonStar },
];

type ReaderAppearanceControlsProps = {
  theme: ReaderTheme;
  fontSize: number;
  onThemeChange: (theme: ReaderTheme) => void;
  onFontSizeChange: (nextFontSize: number) => void;
};

const clampFontSize = (value: number) => Math.min(22, Math.max(14, value));

export default function ReaderAppearanceControls({
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
}: ReaderAppearanceControlsProps) {
  const zoomPercent = Math.round((fontSize / 16) * 100);

  return (
    <div
      className="reader-appearance-controls"
      role="toolbar"
      aria-label="Reader appearance controls"
    >
      <div className="reader-theme-toggle-group">
        {themeButtonConfig.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            className={`reader-theme-button ${theme === value ? "active" : ""}`}
            aria-pressed={theme === value}
            onClick={() => onThemeChange(value)}
            title={`${label} mode`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="reader-font-controls" aria-label="Font size controls">
        <button
          type="button"
          className="reader-font-button"
          onClick={() => onFontSizeChange(clampFontSize(fontSize - 2))}
          aria-label="Decrease font size"
          title="Decrease font size"
        >
          <Minus size={16} />
          <span className="sr-only">Decrease</span>
        </button>

        <span className="reader-font-badge" aria-live="polite">
          {zoomPercent}%
        </span>

        <button
          type="button"
          className="reader-font-button"
          onClick={() => onFontSizeChange(clampFontSize(fontSize + 2))}
          aria-label="Increase font size"
          title="Increase font size"
        >
          <Plus size={16} />
          <span className="sr-only">Increase</span>
        </button>
      </div>
    </div>
  );
}
