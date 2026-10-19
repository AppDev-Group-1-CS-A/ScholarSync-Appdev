import { Router } from "express";
import {
  getAllBooks,
  checkBookExists,
  getBookBySlug,
  createBook,
  deleteBook,
  saveBookSegments,
  searchSegments,
} from "../controllers/book.controller";

const router = Router();

router.get("/", getAllBooks);
router.get("/check/:title", checkBookExists);
router.get("/slug/:slug", getBookBySlug);
router.get("/:id/search", searchSegments);
router.post("/", createBook);
router.post("/:id/segments", saveBookSegments);
router.delete("/:id", deleteBook);

export default router;
