import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";

export async function getSession() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    if (cookieStore.get("admin_session")?.value === "authenticated") {
      return {
        userId: "admin_standalone",
        firstName: "System Admin",
        email: "admin@scholarsync.com",
        role: "admin",
      };
    }
  } catch (e) {
    // cookies() unavailable outside request context
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) return null;

    const firstName = clerkUser.firstName || "Scholar";
    const lastName = clerkUser.lastName || "User";

    const adminEmails = [
      "keith.admin.study@gmail.com",
      "keithbrianlaranjo82@gmail.com",
      "keithbrianlaranjo@gmail.com",
    ];
    const isHardcodedAdmin = adminEmails.includes(email.toLowerCase());

    // Synchronize user profile with backend REST API
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/sync-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: userId,
          email,
          firstName,
          lastName,
        }),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user?.status === "banned") return null;
        return {
          userId,
          firstName: data.user?.firstName || firstName,
          email: data.user?.email || email,
          role: data.user?.role || (isHardcodedAdmin ? "admin" : "user"),
        };
      }
    } catch (syncError) {
      console.warn("Backend user sync offline:", syncError);
    }

    const role = isHardcodedAdmin ? "admin" : "user";
    return {
      userId,
      firstName,
      email,
      role,
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}
