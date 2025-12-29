import { PrismaClient } from "@prisma/client";
import multer from "multer";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
dotenv.config();

const prisma = new PrismaClient();

// config pour multer pour upload en memoire
export const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
}).array("Covers", 10); // max 10 fichiers

// init client s3 ovh
const s3 = new S3Client({
  endpoint: "https://s3.eu-west-par.io.cloud.ovh.net/",
  region: "eu-west-par",
  credentials: {
    accessKeyId: process.env.OVH_ACCESS_KEY,
    secretAccessKey: process.env.OVH_SECRET_KEY,
  },
});

// fonction pour upload un fichier sur ovh
const uploadToOVH = async (file) => {
  const command = new PutObjectCommand({
    Bucket: "fast-liskov",
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // rendre public
  });

  await s3.send(command); // envoi vers ovh
  return `https://fast-liskov.s3.eu-west-par.io.cloud.ovh.net/${command.input.Key}`;
};

/* --- recupere toutes les annonces --- */
export const getAllAnnonces = async (req, res) => {
  try {
    const annonces = await prisma.annonces.findMany({
      include: { user: true, category: true }, // joint user et category
    });
    res.status(200).json(annonces);
  } catch (error) {
    console.error("erreur getAllAnnonces:", error);
    res.status(500).json({ error: "erreur serveur" });
  }
};

/* --- recupere toutes les annonces validé --- */
export const getValidatedAnnonces = async (req, res) => {
  try {
    const annonces = await prisma.annonces.findMany({
      where: { Statut: "Validée" }, // filtrer les en cours
      include: { user: true, category: true },
    });
    res.status(200).json(annonces);
  } catch (error) {
    console.error("erreur getValidatedAnnonces:", error);
    res.status(500).json({ error: "erreur serveur" });
  }
};

export const getMyValidatedAnnonces = async (req, res) => {
  try {
    const annonces = await prisma.annonces.findMany({
      where: {
        Statut: "Validée",
        userId: req.user.id,
      },
      include: {
        user: true,
        category: true,
      },
    });

    res.status(200).json(annonces);
  } catch (error) {
    console.error("erreur getMyValidatedAnnonces:", error);
    res.status(500).json({ error: "erreur serveur" });
  }
};

/* --- recupere une annonce par id --- */
export const getAnnonceById = async (req, res) => {
  const { id } = req.params;
  try {
    const annonce = await prisma.annonces.findUnique({
      where: { id: Number(id) },
      include: { user: true, category: true },
    });
    if (!annonce) return res.status(404).json({ error: "annonce introuvable" });
    res.status(200).json(annonce);
  } catch (error) {
    console.error("erreur getAnnonceById:", error);
    res.status(500).json({ error: "erreur serveur" });
  }
};

/* --- recupere mes annonces --- */
export const getMyAnnonces = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "non authentifié" });

    const annonces = await prisma.annonces.findMany({
      where: { userId: req.user.id },
      include: { user: true, category: true },
    });

    res.status(200).json(annonces);
  } catch (error) {
    console.error("erreur getMyAnnonces:", error);
    res.status(500).json({ error: "erreur serveur" });
  }
};

/* --- creer une annonce --- */
export const createAnnonce = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "non authentifié" });

  const {
    Title,
    Description,
    Price,
    Tags = "",
    Equipments = "",
    Locations = "",
    dates,
    categoryId,
    firstDate,
    nbGuest,
  } = req.body;

  try {
    const files = req.files || [];
    const coversUrls = await Promise.all(files.map(uploadToOVH)); // upload tous les fichiers. VERIFIER A QUOI SERT PROMISE
    const parsedDates = JSON.parse(dates).map((d) => new Date(d));

    const parsedFirstDate = firstDate ? new Date(firstDate) : parsedDates[0];

    const annonce = await prisma.annonces.create({
      data: {
        Title,
        Description,
        Price: Number(Price),
        Covers: coversUrls,
        Tags, // stocke tags séparé par ,
        Equipments, // stocke equipments séparé par ,
        Locations,
        firstDate: parsedFirstDate,
        nbGuest: Number(nbGuest),
        dates: parsedDates,
        userId: req.user.id,
        categoryId: Number(categoryId),
      },
    });

    res.status(201).json(annonce);
  } catch (error) {
    console.error("erreur createAnnonce:", error);
    res.status(500).json({ error: "erreur serveur" });
  }
};

/* --- modifier une annonce --- */
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
    console.error("erreur modifyAnnonce:", error);
    res.status(500).json({ error: "erreur lors de la modification" });
  }
};

/* --- supprimer une annonce --- */
export const deleteAnnonce = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.annonces.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "annonce supprimée avec succes" });
  } catch (error) {
    console.error("erreur deleteAnnonce:", error);
    res.status(500).json({ error: "erreur lors de la suppression" });
  }
};

export const updateAnnonceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Validée", "Refusée"].includes(status)) {
    return res.status(400).json({ error: "Statut invalide" });
  }

  try {
    const annonce = await prisma.annonces.update({
      where: { id: Number(id) },
      data: { Statut: status },
    });

    res.json(annonce);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
