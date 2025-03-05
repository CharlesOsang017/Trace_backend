import express from "express";
import {
  assignIssue,
  createIssue,
  deleteIssue,
  updateIssue,
  getAllIssues,
  getSingleIssue,
  getLatestIssues,
} from "../controllers/issue.controller.js";
import { admin } from "../middlewares/admin.middleware.js";
import { protectRoute } from "../middlewares/protect.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, admin, createIssue);
router.post("/assign", protectRoute, admin, assignIssue);
router.delete("/delete/:issueId", protectRoute, admin, deleteIssue);
router.put("/update/:issueId", protectRoute, admin, updateIssue);
router.get("/all", protectRoute, getAllIssues);
router.get("/status", protectRoute, admin, getAllIssues);
router.get("/:issueId", protectRoute, admin, getSingleIssue);
router.get("/", protectRoute, admin, getLatestIssues);

export default router;
