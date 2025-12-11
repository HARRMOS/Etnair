import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

// GET /users
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        annonces: true,
      },
    });
    if (!category) {
      return res.status(404).json({ error: "Category introuvable" });
    } else {
      res.json(category);
    }
  } catch (error) {
    console.error("Erreur getCategoryById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await prisma.category.findMany();
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /users
export const createCategory = async (req, res) => {
  const { name, descriptionCategory, CategoryPictures } = req.body;

  // Validation des champs requis
  if (!type || !name || !descriptionCategory || !CategoryPictures) {
    return res.status(400).json({
      error:
        "Champs manquants : type, name, descriptionCategory et CategoryPictures sont requis",
    });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        type,
        name,
        descriptionCategory,
        CategoryPictures,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Erreur createCategory:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création" });
  }
};
/* --- DELETE --- */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        annonces: true,
      },
    });
    if (!existingCategory) {
      return res.status(404).json({ error: "Catégorie introuvable" });
    }
    // Vérifier s'il y a des annonces associées
    if (existingCategory.annonces.length > 0) {
      return res.status(400).json({
        error:
          "Impossible de supprimer la catégorie : des annonces y sont associées",
      });
    }
    await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteCategory:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Catégorie introuvable" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

export default {
  getCategoryById,
  createCategory,
  getCategory,
  deleteCategory,
};
