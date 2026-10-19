import { Request, Response } from "express";
import User from "../models/user.model";
import Book from "../models/book.model";
import { serializeData } from "../utils";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();

    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        const bookCount = await Book.countDocuments({
          $or: [
            { userId: user._id.toString() },
            { clerkId: user.clerkId || user._id.toString() },
          ],
        });
        return {
          ...user,
          bookCount,
        };
      })
    );

    return res.json({
      success: true,
      data: serializeData(enrichedUsers),
    });
  } catch (error) {
    console.error("Admin Error (getAllUsers):", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};

export const toggleUserRole = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const newRole = user.role === "admin" ? "user" : "admin";
    user.role = newRole;
    await user.save();

    return res.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Admin Error (toggleUserRole):", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};

export const toggleUserBan = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, error: "Cannot ban an administrator" });
    }

    const newStatus = user.status === "active" ? "banned" : "active";
    user.status = newStatus;
    await user.save();

    return res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Admin Error (toggleUserBan):", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res.status(400).json({ success: false, error: "Cannot delete an administrator" });
    }

    await User.findByIdAndDelete(id);
    await Book.deleteMany({
      $or: [{ userId: id }, { clerkId: userToDelete.clerkId }],
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Admin Error (deleteUser):", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ success: false, error: "Missing clerkId or email" });
    }

    const role =
      email.toLowerCase() === "keith.admin.study@gmail.com" ? "admin" : undefined;

    const user = await User.findOneAndUpdate(
      { $or: [{ clerkId }, { email }] },
      {
        $set: {
          clerkId,
          firstName: firstName || "Scholar",
          lastName: lastName || "User",
          email,
          ...(role ? { role } : {}),
        },
        $setOnInsert: { status: "active" },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.json({
      success: true,
      user: serializeData(user),
    });
  } catch (error) {
    console.error("User Sync Error:", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};
