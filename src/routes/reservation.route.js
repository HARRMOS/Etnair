import express from "express";
import {
  getReservationById,
  createReservation,
  getReservation,
  deleteReservation,
} from "../controllers/reservation.controllers.js";
import { Router } from "express";
import { auth } from "../Middleware/auth.js";

const router = Router();

router.post("/", createReservation);
router.get("/", getReservation);
router.get("/:id", auth, getReservationById);
router.delete("/:id", auth, deleteReservation);

export default router;
