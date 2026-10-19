import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/mongoose";
import User from "@/database/models/user.model";

export async function getSession() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  await connectToDatabase();
  const firstName = clerkUser.firstName || "Scholar";
  const lastName = clerkUser.lastName || "User";
  const role =
    email.toLowerCase() === "keith.admin.study@gmail.com" ? "admin" : undefined;

  const user = await User.findOneAndUpdate(
    { $or: [{ clerkId: userId }, { email }] },
    {
      $set: {
        clerkId: userId,
        firstName,
        lastName,
        email,
        ...(role ? { role } : {}),
      },
      $setOnInsert: { status: "active" },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  ).lean();

  if (user.status === "banned") return null;

  return {
    userId,
    firstName: user.firstName,
    email: user.email,
    role: user.role,
  };
}
