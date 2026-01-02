import { Router } from "express";
import {
  getReservationById,
  createReservation,
  deleteReservation,
} from "../controllers/reservation.controllers.js";
import { auth } from "../Middleware/auth.js";

const router = Router();

router.post("/", auth, createReservation);
router.get("/:id", auth, getReservationById);
router.delete("/:id", auth, deleteReservation);

export default router;
