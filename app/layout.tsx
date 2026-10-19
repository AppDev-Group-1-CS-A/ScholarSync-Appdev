import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScholarSync",
  description:
    "Your AI Study Companion. Sync your books and class PDFs to chat, summarize, and learn more effectively.",
  icons: {
    icon: "/assets/open-book.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased flex flex-col min-h-screen`}
      >
        <ClerkProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
