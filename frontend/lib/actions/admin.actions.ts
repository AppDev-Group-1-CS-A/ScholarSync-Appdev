"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

export async function isAdmin() {
  const session = await getSession();
  return session?.role === "admin";
}

export async function getAllUsersForAdmin() {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      cache: "no-store",
    });

    return await res.json();
  } catch (error) {
    console.error("Admin Error (fetching users):", error);
    return { success: false, error: String(error) };
  }
}

export async function toggleUserRole(targetUserId: string) {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    const session = await getSession();
    if (session?.userId === targetUserId) {
      throw new Error("You cannot change your own role.");
    }

    const res = await fetch(`${BACKEND_URL}/api/admin/users/${targetUserId}/role`, {
      method: "PATCH",
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/admin");
    }
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function toggleUserBan(targetUserId: string) {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/admin/users/${targetUserId}/ban`, {
      method: "PATCH",
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/admin");
    }
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deleteUserByAdmin(targetUserId: string) {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    const session = await getSession();
    if (session?.userId === targetUserId) {
      throw new Error("You cannot delete your own admin account.");
    }

    const res = await fetch(`${BACKEND_URL}/api/admin/users/${targetUserId}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/admin");
    }
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
