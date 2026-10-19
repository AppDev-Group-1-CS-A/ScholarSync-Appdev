"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function fetchSession() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setSession(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        // use cache: "no-store" to ensure we get fresh session data on navigation/redirects
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSession(data);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        setSession(null);
        setStatus("unauthenticated");
      }
    }
    fetchSession();
  }, [isLoaded, isSignedIn, pathname]);

  return { session, status };
}
