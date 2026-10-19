import { Document, Types } from "mongoose";

export interface IBook extends Document {
  userId: string;
  clerkId?: string;
  title: string;
  slug: string;
  author: string;
  persona?: string;
  fileURL: string;
  fileBlobKey: string;
  coverURL?: string;
  coverBlobKey?: string;
  fileSize: number;
  totalSegments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookSegment extends Document {
  userId: string;
  clerkId?: string;
  bookId: Types.ObjectId;
  content: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoiceSession extends Document {
  userId: string;
  bookId: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  billingPeriodStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface CreateBook {
  userId: string;
  title: string;
  author: string;
  persona?: string;
  fileURL: string;
  fileBlobKey: string;
  coverURL?: string;
  coverBlobKey?: string;
  fileSize: number;
}

export interface TextSegment {
  text: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
}

export interface Messages {
  role: string;
  content: string;
}

export interface StartSessionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface EndSessionResult {
  success: boolean;
  error?: string;
}
