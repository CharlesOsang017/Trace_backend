import express from "express";
import {
  loginUser,
  getMe,
  logOutUser,
  registerUser,
  getAllTechnicians,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protect.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);
router.get("/me", protectRoute, getMe);
router.get("/", protectRoute, admin, getAllTechnicians);

export default router;
