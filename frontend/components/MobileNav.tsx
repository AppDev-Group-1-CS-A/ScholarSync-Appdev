"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, PlusCircle, LogOut, ShieldAlert } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

interface MobileNavProps {
  status: "authenticated" | "unauthenticated" | "loading";
  isAdmin?: boolean;
}

export default function MobileNav({ status, isAdmin }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="sm:hidden">
      {/* Hamburger Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-[#212a3b] hover:bg-black/5 transition-colors"
        aria-label="Open mobile menu"
      >
        <Menu size={24} />
      </button>

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#f8f4e9] z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-black/10">
            <span className="font-serif font-bold text-xl text-[#212a3b]">ScholarSync</span>
            <button
              onClick={closeMenu}
              className="p-1.5 rounded-lg hover:bg-black/5 text-[#212a3b]"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3 mt-6">
            <Link
              href="/"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === "/" ? "bg-[#663820] text-white" : "text-[#212a3b] hover:bg-black/5"
              }`}
            >
              <BookOpen size={18} />
              <span>Library</span>
            </Link>

            {status === "authenticated" && !isAdmin && (
              <Link
                href="/books/new"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  pathname.startsWith("/books/new") ? "bg-[#663820] text-white" : "text-[#212a3b] hover:bg-black/5"
                }`}
              >
                <PlusCircle size={18} />
                <span>Add New Book</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  pathname.startsWith("/admin") ? "bg-[#663820] text-white" : "text-[#212a3b] hover:bg-black/5"
                }`}
              >
                <ShieldAlert size={18} />
                <span>Control Center</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Footer Auth Controls */}
        <div className="pt-6 border-t border-black/10">
          {status === "unauthenticated" ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="w-full text-center py-2.5 rounded-xl border border-[#212a3b] font-bold text-sm text-[#212a3b]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMenu}
                className="w-full text-center py-2.5 rounded-xl bg-[#212a3b] font-bold text-sm text-white"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <SignOutButton>
              <button
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          )}
        </div>
      </div>
    </div>
  );
}