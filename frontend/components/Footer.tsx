import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[var(--bg-primary)] border-t border-black/5 py-8 mt-auto">
      <div className="wrapper flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] font-medium">
          <span>&copy; {new Date().getFullYear()} ScholarSync.</span>
          <span>All rights reserved.</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#212a3b]">
          <span>Developed by</span>
          <Link 
            href="https://keithlar.vercel.app/" 
            target="_blank" 
            className="text-[#663820] hover:underline transition-all underline-offset-4"
          >
            Keithlar
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
