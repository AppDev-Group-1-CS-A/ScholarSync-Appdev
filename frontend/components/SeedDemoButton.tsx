"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { seedDemoBook } from "@/lib/actions/book.actions";
import { toast } from "@/lib/toast";

interface SeedDemoButtonProps {
  userId?: string;
  className?: string;
  variant?: "primary" | "secondary" | "minimal";
}

export default function SeedDemoButton({
  userId,
  className = "",
  variant = "secondary",
}: SeedDemoButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    try {
      setLoading(true);
      const res = await seedDemoBook(userId);

      if (res?.success) {
        toast.success(
          res.message || "Demo textbook 'Introduction to Computer Science' added to your library!"
        );
        router.refresh();
      } else {
        toast.error(res?.error || "Failed to seed demo textbook.");
      }
    } catch (err) {
      console.error("Seed error:", err);
      toast.error("Failed to seed demo textbook.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "primary") {
    return (
      <button
        onClick={handleSeed}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#663820] text-white rounded-xl font-bold hover:bg-[#7a4528] transition-all disabled:opacity-50 shadow-sm ${className}`}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Sparkles size={18} className="text-[#e2a970]" />
        )}
        {loading ? "Seeding Demo..." : "Load Demo Textbook"}
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleSeed}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#663820] hover:text-[#7a4528] underline transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
        {loading ? "Seeding..." : "Load Demo Textbook"}
      </button>
    );
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#663820]/20 text-[#663820] font-bold hover:bg-[#fbf4ea] transition-all shadow-sm disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Sparkles size={18} className="text-[#663820]" />
      )}
      {loading ? "Seeding Demo..." : "Load Demo Textbook"}
    </button>
  );
}
