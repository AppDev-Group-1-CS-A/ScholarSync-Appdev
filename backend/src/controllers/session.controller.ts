import { Request, Response } from "express";
import VoiceSession from "../models/voice-session.model";
import { getCurrentBillingPeriodStart } from "../utils";

export const startVoiceSession = async (req: Request, res: Response) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        error: "Missing userId or bookId",
      });
    }

    const session = await VoiceSession.create({
      userId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart: getCurrentBillingPeriodStart(),
      durationSeconds: 0,
    });

    console.log(`[startVoiceSession] Voice session created: ${session._id}`);

    return res.status(201).json({
      success: true,
      sessionId: session._id.toString(),
    });
  } catch (error) {
    console.error("Error starting voice session:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to start voice session",
    });
  }
};

export const endVoiceSession = async (req: Request, res: Response) => {
  try {
    const { sessionId, durationSeconds = 0 } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Missing sessionId",
      });
    }

    const result = await VoiceSession.findByIdAndUpdate(sessionId, {
      endedAt: new Date(),
      durationSeconds,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Voice session not found",
      });
    }

    console.log(`[endVoiceSession] Session ${sessionId} ended with ${durationSeconds}s`);

    return res.json({ success: true });
  } catch (error) {
    console.error("Error ending voice session:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to end voice session. Please try again later.",
    });
  }
};
