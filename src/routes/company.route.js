import express from "express";
import {
  getCompanyById,
  createCompany,
  getCompany,
  deleteCompany,
} from "../controllers/company.controllers.js";
import { Router } from "express";
import { auth } from "../Middleware/auth.js";

const router = Router();

router.post("/", createCompany);
router.get("/", getCompany);
router.get("/:id", auth, getCompanyById);
router.delete("/:id", auth, deleteCompany);

export default router;
