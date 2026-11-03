import { model, Schema, models } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citations: [
      {
        pageNumber: Number,
        segmentIndex: Number,
      },
    ],
  },
  { timestamps: true }
);

ChatMessageSchema.index({ bookId: 1, userId: 1, createdAt: 1 });

const ChatMessage = models?.ChatMessage || model("ChatMessage", ChatMessageSchema);
export default ChatMessage;