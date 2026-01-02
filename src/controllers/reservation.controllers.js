import { PrismaClient } from "@prisma/client";
import multer from "multer";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();

const prisma = new PrismaClient();
/* --- CREATE RESERVATION --- */
export const createReservation = async (req, res) => {
  try {
    const { GuestNb, annoncesId, dates } = req.body;
    const userId = req.user?.id;

    if (
      !GuestNb ||
      !annoncesId ||
      !Array.isArray(dates) ||
      dates.length === 0
    ) {
      return res.status(400).json({ error: "Données invalides ou manquantes" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // --- Récup de l'annonce ---
    const annonce = await prisma.annonces.findUnique({
      where: { id: Number(annoncesId) },
    });

    if (!annonce) {
      return res.status(404).json({ error: "Annonce introuvable" });
    }

    // --- code chat a verifier probleme avec la syntaxe des dates ---
    const normalizeDate = (date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    const reservedDates = dates.map((d) => normalizeDate(new Date(d)));
    const availableDates = annonce.dates.map((d) => normalizeDate(new Date(d)));

    // --- verification de disponibilite des dates ---
    const allAvailable = reservedDates.every((d) => availableDates.includes(d));
    if (!allAvailable) {
      return res
        .status(400)
        .json({ error: "Certaines dates ne sont plus disponibles" });
    }

    const remainingDates = annonce.dates.filter(
      (d) => !reservedDates.includes(normalizeDate(new Date(d)))
    );
    const totalCost = annonce.Price * dates.length;

    const [reservation] = await prisma.$transaction([
      prisma.annonces.update({
        where: { id: annonce.id },
        data: { dates: remainingDates },
      }),
      prisma.reservations.create({
        data: {
          ReservationDates: dates.map((d) => new Date(d)),
          GuestNb: Number(GuestNb),
          TotalCost: totalCost,
          Status: "En cours",
          annoncesId: annonce.id,
          UserId: userId,
        },
      }),
    ]);

    // ---  Réponse ---
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Erreur createReservation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- GET ALL --- */
export const getAllReservations = async (req, res) => {
  try {
    // Si admin, voir toutes les réservations, sinon seulement les siennes
    const where = {};
    if (!req.user?.isadmin) {
      where.UserId = req.user?.id || req.userId;
    }
    const reservations = await prisma.reservations.findMany({
      where,
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
     
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getAllReservations:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- GET BY ID --- */
export const getReservationById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID invalide" });
  }
  try {
    const reservation = await prisma.reservations.findUnique({
      where: { id: Number(id) },
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
    });
    if (!reservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    // Vérifier que l'utilisateur peut voir cette réservation
    if (
      !req.user?.isadmin &&
      reservation.UserId !== (req.user?.id || req.userId)
    ) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Erreur getReservationById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- GET BY USER ID --- */
export const getReservationsByUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "userId invalide" });
  }
  // Vérifier que l'utilisateur peut voir ses propres réservations ou qu'il est admin
  if (!req.user?.isadmin && Number(userId) !== (req.user?.id || req.userId)) {
    return res.status(403).json({ error: "Accès interdit" });
  }
  try {
    const reservations = await prisma.reservations.findMany({
      where: { UserId: Number(userId) },
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
      orderBy: {
        arrivalDate: "desc",
      },
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getReservationsByUser:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
/* --- UPDATE --- */
export const updateReservation = async (req, res) => {
  const { id } = req.params;

  const { arrivalDate, departureDate, GuestNb, TotalCost, Status } = req.body;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID invalide" });
  }
  try {
    // Vérifier que la réservation existe
    const existingReservation = await prisma.reservations.findUnique({
      where: { id: Number(id) },
    });
    if (!existingReservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    // Vérifier les permissions
    if (
      !req.user?.isadmin &&
      existingReservation.UserId !== (req.user?.id || req.userId)
    ) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    const updateData = {};
    if (arrivalDate !== undefined) {
      const arrival = new Date(arrivalDate);
      if (isNaN(arrival.getTime())) {
        return res
          .status(400)
          .json({ error: "Format de date d'arrivée invalide" });
      }
      updateData.arrivalDate = arrival;
    }
    if (departureDate !== undefined) {
      const departure = new Date(departureDate);
      if (isNaN(departure.getTime())) {
        return res
          .status(400)
          .json({ error: "Format de date de départ invalide" });
      }
      updateData.departureDate = departure;
    }
    if (GuestNb !== undefined) {
      if (GuestNb < 1) {
        return res
          .status(400)
          .json({ error: "Le nombre d'invités doit être au moins 1" });
      }
      updateData.GuestNb = Number(GuestNb);
    }
    if (TotalCost !== undefined) {
      if (TotalCost <= 0) {
        return res
          .status(400)
          .json({ error: "Le coût total doit être supérieur à 0" });
      }
      updateData.TotalCost = Number(TotalCost);
    }
    if (Status !== undefined) {
      updateData.Status = Status;
    }
    const updatedReservation = await prisma.reservations.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        anonces: {
          include: {
            user: true,
            category: true,
          },
        },
        user: true,
        review: true,
      },
    });
    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error("Erreur updateReservation:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};
/* --- DELETE --- */
export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID invalide" });
  }
  try {
    // Vérifier que la réservation existe
    const existingReservation = await prisma.reservations.findUnique({
      where: { id: Number(id) },
    });
    if (!existingReservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    // Vérifier les permissions
    if (
      !req.user?.isadmin &&
      existingReservation.UserId !== (req.user?.id || req.userId)
    ) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    await prisma.reservations.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteReservation:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Réservation introuvable" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};
export default {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByUser,
  updateReservation,
  deleteReservation,
};
