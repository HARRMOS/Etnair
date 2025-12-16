import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

// GET /users
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        annonces: true,
        reservations: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error("Erreur getUserById:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /users
export const createUser = async (req, res) => {
  const {
    birthdate,
    login,
    password,
    firstname,
    lastname,
    email,
    phone,
    userpictures,
  } = req.body;

  try {
    // Vérifier si l'email existe déjà
    const emailExists = await prisma.users.findUnique({
      where: { email },
    });

    if (emailExists) {
      return res.status(400).json({ error: "L'email est déjà utilisé." });
    }

    // Vérifier si le login existe déjà (optionnel mais conseillé)
    const loginExists = await prisma.users.findUnique({
      where: { login },
    });

    if (loginExists) {
      return res.status(400).json({ error: "Le login est déjà utilisé." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du user
    const newUser = await prisma.users.create({
      data: {
        birthdate: birthdate ? new Date(birthdate) : null,
        login,
        password: hashedPassword,
        firstname,
        lastname,
        email,
        phone,
        userpictures,
      },
    });

    return res.json(newUser);
  } catch (e) {
    console.error("Prisma Error:", e);
    return res.status(500).json({ error: "Impossible de créer l'utilisateur" });
  }
};
export const login = async (req, res) => {
  const { login: loginInput, password } = req.body;

  try {
    // 1) Vérifier que l'utilisateur existe
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { login: loginInput },
          { email: loginInput }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Login incorrect" });
    }

    // 2) Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // 3) Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    // 4) Retourner le token
    return res.json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

/* --- MODIFY --- */
export const modifyUser = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const modifyUser = await prisma.users.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(modifyUser);
  } catch (error) {
    console.error("Erreur modifyUser:", error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};

/* --- DELETE --- */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.users.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Users supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteUser:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

export default {
  getUserById,
  createUser,
  getUsers,
  deleteUser,
  modifyUser,
};
