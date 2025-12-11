import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* --- GET ALL --- */
export const getAllAnnonces = async (req, res) => {
  try {
    const annonces = await prisma.annonces.findMany({
      include: { user: true, category: true },
    });
    res.status(200).json(annonces);
  } catch (error) {
    console.error("Erreur getAllAnnonces:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* --- GET BY ID --- */
export const getAnnonceById = async (req, res) => {
  const { id } = req.params;
  try {
    const annonce = await prisma.annonces.findUnique({
      where: { id: Number(id) },
      include: { user: true, category: true },
    });
    if (!annonce) return res.status(404).json({ error: "Annonce introuvable" });

    res.status(200).json(annonce);
  } catch (error) {
    console.error("Erreur getAnnonceById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* --- CREATE --- */
export const createAnnonce = async (req, res) => {
  const {
    title,
    description,
    price,
    cover,
    tags,
    esuipements,
    Locations,
    userId,
    categoryId,
  } = req.body;

  try {
    const newAnnonce = await prisma.annonces.create({
      data: {
        title,
        description,
        price,
        cover,
        tags,
        esuipements,
        Locations,
        userId: Number(userId),
        categoryId: Number(categoryId),
      },
    });

    res.status(201).json(newAnnonce);
  } catch (error) {
    console.error("Erreur createAnnonce:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création" });
  }
};

/* --- MODIFY --- */
export const modifyAnnonce = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedAnnonce = await prisma.annonces.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(updatedAnnonce);
  } catch (error) {
    console.error("Erreur modifyAnnonce:", error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};

/* --- DELETE --- */
export const deleteAnnonce = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.annonces.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Annonce supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteAnnonce:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};
