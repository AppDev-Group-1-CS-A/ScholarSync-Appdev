"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function useSession() {
  const [session, setSession] = useState<{
    userId: string;
    firstName: string;
    email: string;
    role: string;
  } | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setSession(null);
      setStatus("unauthenticated");
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress || "";
    const role =
      email.toLowerCase() === "keith.admin.study@gmail.com" ? "admin" : "user";

    const sessionData = {
      userId: user.id,
      firstName: user.firstName || "Scholar",
      email,
      role,
    };

    setSession(sessionData);
    setStatus("authenticated");

    // Sync user with backend in background
    fetch(`${BACKEND_URL}/api/admin/sync-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email,
        firstName: user.firstName || "Scholar",
        lastName: user.lastName || "User",
      }),
    }).catch((err) => {
      console.warn("Backend sync offline:", err);
    });
  }, [isLoaded, isSignedIn, user]);

  return { session, status };
}
