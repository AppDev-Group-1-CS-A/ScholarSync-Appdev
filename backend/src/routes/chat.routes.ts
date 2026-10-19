import { Router } from "express";
import { chatWithBook } from "../controllers/chat.controller";

const router = Router();

router.post("/", chatWithBook);

export default router;
