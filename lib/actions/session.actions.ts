"use server";

import { connectToDatabase } from "@/database/mongoose";
import { StartSessionResult, EndSessionResult } from "@/types";
import VoiceSession from "@/database/models/voice-session.model";
import { getCurrentBillingPeriodStart } from "@/lib/subscription-constants";

export const startVoiceSession = async (
  userId: string,
  bookId: string,
): Promise<StartSessionResult> => {
  try {
    console.log(`[startVoiceSession] Called for userId: ${userId}, bookId: ${bookId}`);
    await connectToDatabase();

    const session = await VoiceSession.create({
      userId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart: getCurrentBillingPeriodStart(),
      durationSeconds: 0,
    });

    console.log(`[startVoiceSession] Session created: ${session._id}`);

    return {
      success: true,
      sessionId: session._id.toString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error starting voice session:", error);
    return {
      success: false,
      error: `Failed to start voice session: ${errorMessage}`,
    };
  }
};

export const endVoiceSession = async (
  sessionId: string,
  durationSeconds: number,
): Promise<EndSessionResult> => {
  try {
    console.log(`[endVoiceSession] Called for sessionId: ${sessionId}, duration: ${durationSeconds}s`);
    await connectToDatabase();

    const result = await VoiceSession.findByIdAndUpdate(sessionId, {
      endedAt: new Date(),
      durationSeconds,
    });

    if (!result) {
      console.warn(`[endVoiceSession] Session not found: ${sessionId}`);
      return { success: false, error: "Voice session not found." };
    }

    console.log(`[endVoiceSession] Session updated successfully`);
    return { success: true };
  } catch (e) {
    console.error("Error ending voice session", e);
    return {
      success: false,
      error: "Failed to end voice session. Please try again later.",
    };
  }
};
