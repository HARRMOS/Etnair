import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

// GET /users
export const getCompanyById = async (req, res) => {
  const { id } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        annonces: true,
      },
    });
    if (!company) {
      return res.status(404).json({ error: "company introuvable" });
    } else {
      res.json(company);
    }
  } catch (error) {
    console.error("Erreur getCompanyById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await prisma.company.findMany();
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /company
export const createCompany = async (req, res) => {
  const {
    CompanyName,
    SiretNumber,
    CompanyPhone,
    CompanyEmail,
    LeaderName,
    userId,
  } = req.body;

  if (!SiretNumber) {
    return res.status(400).json({ error: "Le CompanyName est obligatoire" });
  }

  try {
    // Vérifier si le nom existe déjà
    const SiretExists = await prisma.company.findUnique({
      where: { SiretNumber },
    });

    if (SiretExists) {
      return res.status(400).json({ error: "Le Siret est déjà utilisé." });
    }

    // Création de la catégorie
    const newCompany = await prisma.company.create({
      data: {
        CompanyName,
        SiretNumber,
        CompanyPhone,
        CompanyEmail,
        LeaderName,
        userId,
      },
    });

    return res.json(newCompany);
  } catch (e) {
    console.error("Prisma Error:", e);
    return res.status(500).json({ error: "Impossible de créer la company" });
  }
};
/* --- DELETE --- */
export const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.company.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Companie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteCompanie:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la Companie" });
  }
};

export default {
  getCompanyById,
  createCompany,
  getCompany,
  deleteCompany,
};
