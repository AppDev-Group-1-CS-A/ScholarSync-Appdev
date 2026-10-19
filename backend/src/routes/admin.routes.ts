import { Router } from "express";
import {
  getAllUsers,
  toggleUserRole,
  toggleUserBan,
  deleteUser,
  syncUser,
} from "../controllers/admin.controller";

const router = Router();

router.get("/users", getAllUsers);
router.patch("/users/:id/role", toggleUserRole);
router.patch("/users/:id/ban", toggleUserBan);
router.delete("/users/:id", deleteUser);
router.post("/sync-user", syncUser);

export default router;
