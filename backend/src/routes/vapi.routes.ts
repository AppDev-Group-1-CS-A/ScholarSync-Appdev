import { Router } from "express";
import { searchBookVapi, logVapi } from "../controllers/vapi.controller";

const router = Router();

router.all("/search-book", searchBookVapi);
router.post("/log", logVapi);

export default router;
