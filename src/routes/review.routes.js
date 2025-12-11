import express from "express";
import {
  getReviewById,
  createReview,
  getReview,
  deleteReview,
} from "../controllers/review.controllers.js";
import { Router } from "express";
import { auth } from "../Middleware/auth.js";

const router = Router();

router.post("/", createReview);
router.get("/", getReview);
router.get("/:id", auth, getReviewById);
router.delete("/:id", auth, deleteReview);

export default router;
