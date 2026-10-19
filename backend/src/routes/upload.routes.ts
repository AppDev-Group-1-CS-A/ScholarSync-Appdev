import { Router } from "express";
import { handleBlobUpload } from "../controllers/upload.controller";

const router = Router();

router.post("/", handleBlobUpload);

export default router;
