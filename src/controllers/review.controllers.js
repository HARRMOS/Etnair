import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

// GET /users
export const getReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        annonces: true,
      },
    });
    if (!review) {
      return res.status(404).json({ error: "review introuvable" });
    } else {
      res.json(review);
    }
  } catch (error) {
    console.error("Erreur getreviewById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getReview = async (req, res) => {
  try {
    const review = await prisma.review.findMany();
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /company
export const createReview = async (req, res) => {
  const { Rating, Comment, CreatedAt, reservationId } = req.body;

  try {
    // Vérifier si le nom existe déjà

    // Création de la catégorie
    const newReview = await prisma.review.create({
      data: {
        Rating,
        Comment,
        CreatedAt,
        reservationId,
      },
    });

    return res.json(newReview);
  } catch (e) {
    console.error("Prisma Error:", e);
    return res.status(500).json({ error: "Impossible de créer la review" });
  }
};
/* --- DELETE --- */
export const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.review.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "review supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deletereview:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la review" });
  }
};

export default {
  getReviewById,
  createReview,
  getReview,
  deleteReview,
};
