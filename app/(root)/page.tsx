import React from "react";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/actions/book.actions";
import Search from "@/components/Search";
import Link from "next/link";
import { sampleBooks } from "@/lib/constants";
import HeroSection from "@/components/HeroSection";
import { getSession } from "@/lib/auth";
import {
  Sparkles,
  BookOpen,
  Mic,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  Zap,
  Layers,
  Globe,
} from "lucide-react";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) => {
  const { query } = await searchParams;
  const session = await getSession();
  const userId = session?.userId;

  // Fetch personal books if signed in
  const bookResults = userId
    ? await getAllBooks(query, userId)
    : { success: true, data: [] };
  
  const dbBooks = bookResults.success ? (bookResults.data ?? []) : [];

  return (
    <div className="pt-[94px] bg-[#f8f4e9] min-h-screen font-sans">
      {/* ==========================================================
          SIGNED IN: THE PROFESSIONAL DASHBOARD
          ========================================================== */}
      {session ? (
        <>
          <HeroSection />
          <main className="wrapper pb-20">
            <div className="flex items-center justify-between mb-10 border-b border-black/5 pb-6">
              <h2 className="text-2xl font-bold text-[#212a3b] flex items-center gap-3">
                <Layers size={24} className="text-[#663820]" />
                Library Overview
              </h2>
              <div className="text-sm text-[#3d485e] font-medium">
                {dbBooks.length} materials indexed
              </div>
            </div>

            <div className="library-books-grid min-h-[300px]">
              {dbBooks.length > 0 ? (
                dbBooks.slice(0, 3).map((book) => (
                  <BookCard
                    key={book._id}
                    id={book._id}
                    title={book.title}
                    author={book.author}
                    coverURL={book.coverURL}
                    slug={book.slug}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-24 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <BookOpen className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[#212a3b] mb-2">Your shelf is empty</h3>
                  <p className="text-[#3d485e] mb-8 max-w-xs mx-auto">
                    Start by uploading a PDF or textbook to create your first AI tutor.
                  </p>
                  <Link
                    href="/books/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#663820] text-white rounded-xl font-bold hover:bg-[#7a4528] transition-all"
                  >
                    + Add Study Material
                  </Link>
                </div>
              )}
            </div>

            {dbBooks.length > 3 && (
              <div className="mt-16 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/50 border border-black/5 text-[#212a3b] font-bold hover:bg-white transition-all shadow-sm"
                >
                  View All Materials ({dbBooks.length}) <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </main>
        </>
      ) : (
        /* ==========================================================
            SIGNED OUT: THE MODERN INTELLIGENT LANDING (SYNCED THEME)
            ========================================================== */
        <div className="overflow-hidden">
          {/* Background Ambient Orbs */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f3e4c7] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-[#fff6e5] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          </div>

          {/* Main Hero - Split Layout */}
          <section className="wrapper pt-16 pb-24 md:pt-24 md:pb-40 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1 text-left">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f3e4c7]/80 backdrop-blur-sm text-[#663820] text-xs font-bold uppercase tracking-wider mb-8 border border-[#663820]/10 animate-fade-in-up" 
                >
                  <Zap size={14} fill="currentColor" /> Powered by Groq & Llama 3.3
                </div>
                
                <h1 
                  className="text-5xl md:text-7xl font-bold text-[#212a3b] mb-8 leading-[1.05] tracking-tight font-serif animate-fade-in-up"
                  style={{ animationDelay: '100ms' }}
                >
                  Sync your mind with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#663820] to-[#a66a4b]">every page.</span>
                </h1>
                
                <p 
                  className="text-xl text-[#3d485e] mb-12 max-w-xl leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: '200ms' }}
                >
                  ScholarSync is the advanced AI workspace that transforms static books into 
                  dynamic knowledge bases. Instant search, voice tutoring, and deep conceptual learning.
                </p>

                <div 
                  className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                  style={{ animationDelay: '300ms' }}
                >
                  <Link href="/sign-up">
                    <button className="w-full sm:w-auto px-10 py-5 bg-[#212a3b] text-white rounded-2xl font-bold text-lg hover:bg-[#3d485e] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#212a3b]/20 flex items-center justify-center gap-3">
                      Start Learning Free <ArrowRight size={20} />
                    </button>
                  </Link>
                  <Link href="/sign-in">
                    <button className="w-full sm:w-auto px-10 py-5 bg-white/70 backdrop-blur-md text-[#212a3b] border border-white/40 shadow-soft-sm rounded-2xl font-bold text-lg hover:bg-white hover:shadow-soft transition-all">
                      Sign In
                    </button>
                  </Link>
                </div>
              </div>

              <div 
                className="flex-1 relative animate-fade-in-up"
                style={{ animationDelay: '400ms' }}
              >
                {/* Mockup decoration */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#f3e4c7]/50 blur-[120px] rounded-full -z-10" />
                <div className="glass-card rounded-[2.5rem] p-4 relative animate-float">
                  <div className="bg-[#fdfcf6]/90 backdrop-blur-md rounded-[1.5rem] h-[400px] w-full overflow-hidden flex flex-col border border-white/50">
                    <div className="h-12 bg-white/60 backdrop-blur-sm border-b border-black/5 flex items-center px-6 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#663820] flex-shrink-0 shadow-sm" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200/80 rounded w-3/4" />
                          <div className="h-4 bg-gray-200/80 rounded w-full" />
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-[#f3e4c7] rounded w-full ml-auto shadow-sm" />
                          <div className="h-4 bg-[#f3e4c7] rounded w-1/2 ml-auto shadow-sm" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white border border-black/5 shadow-sm flex-shrink-0" />
                      </div>
                      <div className="pt-8 relative">
                        <div className="absolute -top-6 -left-4 w-32 h-32 bg-blue-100/30 blur-2xl rounded-full -z-10" />
                        <div className="h-12 bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-sm px-4 flex items-center text-gray-400 text-sm">
                          Ask about Chapter 4...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bento Grid Features */}
          <section className="relative py-32 z-10">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] -z-10" />
            <div className="wrapper">
              <div className="text-center mb-20 animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold text-[#212a3b] mb-6 font-serif">Designed for deep learning.</h2>
                <p className="text-lg text-[#3d485e]">Everything you need to master your curriculum, accelerated by AI.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
                {/* Feature 1: Main */}
                <div className="md:col-span-8 md:row-span-2 glass-card rounded-[2.5rem] p-12 flex flex-col justify-between group overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:shadow-soft-lg cursor-default">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-[#f3e4c7]/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 text-[#663820] shadow-sm">
                      <BrainCircuit size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-[#212a3b] mb-4 font-serif">Neural Context Engine</h3>
                    <p className="text-lg text-[#3d485e] max-w-md">
                      We don't just search text. Our engine understands the semantic relationships 
                      between concepts across your entire library.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                    <Globe size={400} className="translate-x-1/4 -translate-y-1/4" />
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#f3e4c7] rounded-full blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                </div>

                {/* Feature 2: Voice */}
                <div className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-[#212a3b] to-[#2d3a52] shadow-soft-lg rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] cursor-default border border-[#3d485e]/50">
                  <div className="relative z-10">
                    <Mic className="mb-4 text-[#f3e4c7]" />
                    <h3 className="text-xl font-bold mb-2">Hands-Free Tutoring</h3>
                    <p className="text-sm text-gray-300">Natural voice conversations with your material.</p>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-1 items-end h-8">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-1 bg-[#f3e4c7] rounded-full animate-bounce h-full shadow-[0_0_8px_rgba(243,228,199,0.5)]" style={{ animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
                </div>

                {/* Feature 3: Citations */}
                <div className="md:col-span-4 md:row-span-1 glass-card rounded-[2.5rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-soft-lg cursor-default relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f3e4c7]/40 rounded-full blur-[40px] group-hover:bg-[#f3e4c7]/60 transition-colors" />
                  <BookOpen className="mb-4 text-[#663820] relative z-10" />
                  <h3 className="text-xl font-bold text-[#212a3b] mb-2 relative z-10">Verified Citations</h3>
                  <p className="text-sm text-[#3d485e] relative z-10">Every AI answer cites the exact page and paragraph.</p>
                </div>

                {/* Feature 4: Privacy */}
                <div className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-[#663820] to-[#804b2e] shadow-soft-lg rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] cursor-default border border-[#a66a4b]/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[30px]" />
                  <ShieldCheck className="mb-4 text-[#f3e4c7] relative z-10" />
                  <h3 className="text-xl font-bold mb-2 relative z-10">Private Knowledge</h3>
                  <p className="text-sm text-[#f3e4c7]/90 relative z-10">Your documents are encrypted and never used for public training.</p>
                </div>

                {/* Feature 5: Multi-Format */}
                <div className="md:col-span-8 md:row-span-1 glass-card rounded-[2.5rem] p-8 flex items-center gap-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-soft-lg cursor-default">
                  <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex-shrink-0 flex items-center justify-center text-[#212a3b] shadow-sm border border-white/50">
                    <Layers size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#212a3b] mb-2 font-serif">Unified Workspace</h3>
                    <p className="text-sm text-[#3d485e]">PDFs, textbooks, and class notes—all synced in one place.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Showcase - Grid */}
          <section className="wrapper py-32">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold text-[#212a3b] mb-6 font-serif">Test the potential.</h2>
                <p className="text-lg text-[#3d485e]">Instant AI interaction with these pre-indexed classic materials.</p>
              </div>
              <Link href="/sign-up" className="text-[#663820] font-bold hover:underline flex items-center gap-2 mb-2">
                Join 1,000+ students <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {sampleBooks.slice(0, 5).map((book) => (
                <div key={book._id} className="hover:scale-105 transition-transform duration-300">
                  <BookCard
                    id={book._id}
                    title={book.title}
                    author={book.author}
                    coverURL={book.coverURL}
                    slug={book.slug}
                    isSample={true}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Modern CTA */}
          <section className="wrapper pb-32">
            <div className="bg-[#212a3b] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#663820]/10 blur-[150px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#663820]/10 blur-[150px] rounded-full" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-7xl font-bold text-white mb-10 tracking-tight leading-tight font-serif">
                  Master your material <br />
                  <span className="text-[#f3e4c7]">in record time.</span>
                </h2>
                <p className="text-xl text-gray-400 mb-12">
                  Stop struggling with static pages. Start syncing with your material today.
                </p>
                <Link href="/sign-up">
                  <button className="px-12 py-6 bg-[#663820] text-white rounded-2xl font-bold text-xl hover:bg-[#7a4528] transition-all shadow-lg hover:scale-105 active:scale-95">
                    Get Started Now
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Page;
