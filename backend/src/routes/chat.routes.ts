import { Router } from "express";
import {
  chatWithBook,
  clearChatHistory,
  getChatHistory,
  summarizeBookSection,
} from "../controllers/chat.controller";

const router = Router();

router.post("/", chatWithBook);
router.post("/summary", summarizeBookSection);
router.get("/history/:bookId", getChatHistory);
router.delete("/history/:bookId", clearChatHistory);

export default router;
