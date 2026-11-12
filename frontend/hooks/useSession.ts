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
      // Check if standalone admin portal session is active
      fetch("/api/admin/session")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.isAdmin) {
            setSession({
              userId: "admin_standalone",
              firstName: "System Admin",
              email: "admin@scholarsync.com",
              role: "admin",
            });
            setStatus("authenticated");
          } else {
            setSession(null);
            setStatus("unauthenticated");
          }
        })
        .catch(() => {
          setSession(null);
          setStatus("unauthenticated");
        });
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress || "";
    const adminEmails = [
      "keith.admin.study@gmail.com",
      "keithbrianlaranjo82@gmail.com",
      "keithbrianlaranjo@gmail.com",
    ];
    const role = adminEmails.includes(email.toLowerCase()) ? "admin" : "user";

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
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role) {
          setSession((prev) =>
            prev ? { ...prev, role: data.user.role } : prev
          );
        }
      })
      .catch((err) => {
        console.warn("Backend sync offline:", err);
      });
  }, [isLoaded, isSignedIn, user]);

  return { session, status };
}
