import express from "express";
import {
  login,
  createUser,
  getUserById,
  getUsers,
  deleteUser,
  modifyUser,
} from "../controllers/userscontrollers.js";
import { Router } from "express";
import { auth } from "../Middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", auth, getUserById);
router.patch("/:id", auth, modifyUser);
router.delete("/:id", auth, deleteUser);
// router.get("/:id/company", usersControllers.companyByUser)

export default router;
