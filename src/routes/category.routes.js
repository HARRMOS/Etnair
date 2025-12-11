import express from "express"; // import categoryControllers from '../controllers/annonces.controllers.js';
import { Router } from "express";
const router = Router();
import { auth } from "../Middleware/auth.js";
import {
  getCategoryById,
  createCategory,
  getCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";

router.get("/", getCategory);
router.post("/", createCategory);
router.post("/:id", auth, getCategoryById);
router.delete("/:id", auth, deleteCategory);

export default router;
