import { Router } from "express";
import { chatWithBook, summarizeBookSection } from "../controllers/chat.controller";

const router = Router();

router.post("/", chatWithBook);
router.post("/summary", summarizeBookSection);

export default router;
