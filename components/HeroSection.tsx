import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const HeroSection = async () => {
  const session = await getSession();

  return (
    <section className="wrapper mb-10 md:mb-16">
      <div className="library-hero-card min-h-[400px]">
        <div className="library-hero-content">
          {/* Left Part */}
          <div className="library-hero-text">
            <div className="relative">
              {/* Small graphic above title */}
              <div className="absolute -top-8 left-20 opacity-40">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 0V34M0 17H34"
                    stroke="#212a3b"
                    strokeWidth="0.5"
                  />
                  <text
                    x="19"
                    y="12"
                    fill="#212a3b"
                    fontSize="6"
                    className="font-sans"
                  >
                    540
                  </text>
                  <text
                    x="19"
                    y="18"
                    fill="#212a3b"
                    fontSize="6"
                    className="font-sans"
                  >
                    270
                  </text>
                </svg>
              </div>
              <h1 className="library-hero-title">Study Assistant</h1>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#663820] bg-white px-2 py-0.5 rounded border border-black/5 shadow-sm">
                Developed by Keithlar
              </span>
            </div>

            <p className="library-hero-description">
              Transform your books and class PDFs into interactive study
              partners.
              <br />
              Summarize, quiz, and master your material with AI.
            </p>

            {session ? (
              <Link href="/books/new" className="library-cta-primary mt-4">
                <span className="text-2xl font-light">+</span>
                <span>Upload Study Material</span>
              </Link>
            ) : (
              <div className="flex flex-wrap gap-4 mt-6">
                <Link href="/sign-up">
                  <button className="library-cta-primary !px-8 !py-3">
                    Get Started (Sign Up)
                  </button>
                </Link>
                <Link href="/sign-in">
                  <button className="px-8 py-3 rounded-full border-2 border-[#663820] text-[#663820] font-bold hover:bg-[#663820]/5 transition-all">
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Center Part - Desktop */}
          <div className="library-hero-illustration-desktop relative z-10">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and a globe"
              width={500}
              height={500}
              className="object-contain"
              priority
            />
          </div>

          {/* Center Part - Mobile (Hidden on Desktop) */}
          <div className="library-hero-illustration relative z-10">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and a globe"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>

          {/* Right Part */}
          <div className="library-steps-card min-w-[280px] shadow-soft-md">
            <ul className="space-y-6">
              <li className="library-step-item">
                <div className="library-step-number">1</div>
                <div className="flex flex-col">
                  <h3 className="library-step-title">Upload PDF</h3>
                  <p className="library-step-description">
                    Add your book or class file
                  </p>
                </div>
              </li>
              <li className="library-step-item">
                <div className="library-step-number">2</div>
                <div className="flex flex-col">
                  <h3 className="library-step-title">AI Indexing</h3>
                  <p className="library-step-description">
                    We process your knowledge base
                  </p>
                </div>
              </li>
              <li className="library-step-item">
                <div className="library-step-number">3</div>
                <div className="flex flex-col">
                  <h3 className="library-step-title">Study Companion</h3>
                  <p className="library-step-description">
                    Chat, summarize & learn
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
