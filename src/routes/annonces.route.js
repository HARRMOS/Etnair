import { Router } from "express";

import {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  modifyAnnonce,
  deleteAnnonce,
} from "../controllers/annonces.controllers.js";
import { auth } from "../Middleware/auth.js";

const router = Router();

router.get("/", getAllAnnonces);
router.get("/:id", auth, getAnnonceById);
router.post("/", createAnnonce);
router.patch("/:id", auth, modifyAnnonce);
router.delete("/:id", auth, deleteAnnonce);

export default router;
