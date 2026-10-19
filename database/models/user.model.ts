import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  clerkId?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  avatar?: string;
  role: "user" | "admin";
  status: "active" | "banned";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    clerkId: { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "banned"], default: "active" },
  },
  { timestamps: true },
);

// Force re-load to include new fields
if (models.User) {
  delete (models as any).User;
}

const User = model<IUser>("User", UserSchema);

export default User;
