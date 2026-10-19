"use server";

import { connectToDatabase } from "@/database/mongoose";
import User from "@/database/models/user.model";
import Book from "@/database/models/book.model";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";

export async function isAdmin() {
  const session = await getSession();
  return session?.role === "admin";
}

export async function getAllUsersForAdmin() {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    await connectToDatabase();

    const users = await User.find().sort({ createdAt: -1 }).lean();
    
    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        const bookCount = await Book.countDocuments({
          $or: [{ userId: user._id.toString() }, { clerkId: user._id.toString() }]
        });
        return {
          ...user,
          bookCount
        };
      })
    );

    return {
      success: true,
      data: serializeData(enrichedUsers),
    };
  } catch (error) {
    console.error("Admin Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function toggleUserRole(targetUserId: string) {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    await connectToDatabase();

    const user = await User.findById(targetUserId);
    if (!user) throw new Error("User not found");
    
    // Don't let admin demote themselves (safety)
    const session = await getSession();
    if (session?.userId === targetUserId) {
      throw new Error("You cannot change your own role.");
    }

    const newRole = user.role === "admin" ? "user" : "admin";
    user.role = newRole;
    await user.save();

    revalidatePath("/admin");
    return { success: true, role: newRole };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function toggleUserBan(targetUserId: string) {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    await connectToDatabase();

    const user = await User.findById(targetUserId);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Cannot ban an administrator");

    const newStatus = user.status === "active" ? "banned" : "active";
    user.status = newStatus;
    await user.save();

    revalidatePath("/admin");
    return { success: true, status: newStatus };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deleteUserByAdmin(targetUserId: string) {
  try {
    if (!(await isAdmin())) throw new Error("Unauthorized");

    await connectToDatabase();

    const session = await getSession();
    if (session?.userId === targetUserId) {
      throw new Error("You cannot delete your own admin account.");
    }

    const userToDelete = await User.findById(targetUserId);
    if (userToDelete?.role === "admin") throw new Error("Cannot delete an administrator");

    await User.findByIdAndDelete(targetUserId);
    await Book.deleteMany({ userId: targetUserId });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
