import { Router } from "express";
import {
  startVoiceSession,
  endVoiceSession,
} from "../controllers/session.controller";

const router = Router();

router.post("/start", startVoiceSession);
router.post("/end", endVoiceSession);

export default router;
