import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";

export async function getSession() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) return null;

    const firstName = clerkUser.firstName || "Scholar";
    const lastName = clerkUser.lastName || "User";

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
          role: data.user?.role || (email.toLowerCase() === "keith.admin.study@gmail.com" ? "admin" : "user"),
        };
      }
    } catch (syncError) {
      console.warn("Backend user sync offline:", syncError);
    }

    const role = email.toLowerCase() === "keith.admin.study@gmail.com" ? "admin" : "user";
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
