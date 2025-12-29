import express from "express";
import {
  login,
  createUser,
  getUserById,
  getUsers,
  deleteUser,
  modifyUser,
  getMyUser,
} from "../controllers/userscontrollers.js";
import { Router } from "express";
import { auth } from "../Middleware/auth.js";

const router = Router();
router.get("/me", auth, getMyUser);
router.get("/:id", auth, getUserById);

router.post("/login", login);
router.post("/", createUser);
router.get("/", getUsers);
router.patch("/:id", auth, modifyUser);
router.delete("/:id", auth, deleteUser);
// router.get("/:id/company", usersControllers.companyByUser)

export default router;
