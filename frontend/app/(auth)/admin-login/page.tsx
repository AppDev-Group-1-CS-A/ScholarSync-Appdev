"use client";

import React, { useState } from "react";
import { loginAsAdmin } from "@/lib/actions/admin.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Lock,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the administrator password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginAsAdmin(password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 700);
      } else {
        setError(res.error || "Authentication failed. Invalid password.");
      }
    } catch (err) {
      setError("An unexpected error occurred while authenticating.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#1b2230] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#663820]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#a66a4b]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 group transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
              <Image
                src="/assets/logo.png"
                alt="ScholarSync Logo"
                width={32}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-serif">
              ScholarSync
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-400/20 mb-3">
            <Shield size={14} /> Master Oversight Portal
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-serif">
            Admin Authentication
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
            Direct gateway to the System Control Center, user management, and grading diagnostics.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
          {success ? (
            <div className="py-12 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-serif">
                Access Granted
              </h3>
              <p className="text-gray-400 text-sm">
                Redirecting to Control Center...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-shake">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Admin Passphrase
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    disabled={loading}
                    autoFocus
                    className="w-full pl-11 pr-12 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Quick Preset for Grading Demo */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-400">Default Demo Key:</span>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold border border-amber-400/20 transition-all hover:scale-105"
                >
                  <Sparkles size={12} />
                  admin123
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#663820] to-[#8a4d2c] hover:from-[#7a4427] hover:to-[#9e5732] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#663820]/30 hover:shadow-[#663820]/50 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Unlock Control Center</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            ← Return to ScholarSync Library
          </Link>
        </div>
      </div>
    </div>
  );
}

