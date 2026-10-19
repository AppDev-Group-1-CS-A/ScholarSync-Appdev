import { Router } from "express";
import bookRoutes from "./book.routes";
import chatRoutes from "./chat.routes";
import sessionRoutes from "./session.routes";
import adminRoutes from "./admin.routes";
import vapiRoutes from "./vapi.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

router.use("/books", bookRoutes);
router.use("/chat", chatRoutes);
router.use("/session", sessionRoutes);
router.use("/admin", adminRoutes);
router.use("/vapi", vapiRoutes);
router.use("/upload", uploadRoutes);

export default router;
