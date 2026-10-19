"use client";

import { cn } from "@/lib/utils";

interface VoiceSelectorProps {
  value?: string;
  onChange: (voice: string) => void;
  disabled?: boolean;
}

const voiceGroups = [
  {
    category: "Male Voices",
    voices: [
      { id: "dave", name: "Dave", description: "Deep, professional" },
      { id: "daniel", name: "Daniel", description: "Clear, engaging" },
      { id: "chris", name: "Chris", description: "Warm, friendly" },
    ],
  },
  {
    category: "Female Voices",
    voices: [
      { id: "rachel", name: "Rachel", description: "Smooth, confident" },
      { id: "sarah", name: "Sarah", description: "Bright, energetic" },
    ],
  },
];

const VoiceSelector = ({
  value,
  onChange,
  disabled = false,
}: VoiceSelectorProps) => {
  return (
    <div className="space-y-6">
      {voiceGroups.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-semibold text-[#212a3b] mb-3">
            {group.category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {group.voices.map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => !disabled && onChange(voice.id)}
                disabled={disabled}
                className={cn(
                  "voice-selector-option voice-selector-option-default",
                  value === voice.id && "voice-selector-option-selected",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <input
                  type="radio"
                  name="voice"
                  value={voice.id}
                  checked={value === voice.id}
                  onChange={() => !disabled && onChange(voice.id)}
                  disabled={disabled}
                  className="cursor-pointer"
                />
                <div className="flex-1 text-left ml-2">
                  <p className="font-semibold text-sm text-[#212a3b]">
                    {voice.name}
                  </p>
                  <p className="text-xs text-[#3d485e]">{voice.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VoiceSelector;
