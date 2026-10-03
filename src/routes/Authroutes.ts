import { Router } from "express";
import { register, login, refresh, logout, me, updateProfile, updateRole } from "./../controllers/authcontroller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, updateProfile);
router.put("/role", requireAuth, updateRole);

export default router;