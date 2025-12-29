import { Router } from "express";
import { auth } from "../Middleware/auth.js";
import {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  modifyAnnonce,
  deleteAnnonce,
  getMyAnnonces,
  getValidatedAnnonces,
  uploadFiles, // ← bien importé maintenant
  updateAnnonceStatus,
  getMyValidatedAnnonces,
} from "../controllers/annonces.controllers.js";

const router = Router();

router.get("/me", auth, getMyAnnonces);
router.get("/validated/me", auth, getMyValidatedAnnonces);
router.get("/validated", auth, getValidatedAnnonces);
router.get("/:id", auth, getAnnonceById);
router.get("/", getAllAnnonces);
router.patch("/:id/status", auth, updateAnnonceStatus);
// Création avec upload
router.post("/", auth, uploadFiles, createAnnonce);

router.patch("/:id", auth, modifyAnnonce);
router.delete("/:id", auth, deleteAnnonce);

export default router;
