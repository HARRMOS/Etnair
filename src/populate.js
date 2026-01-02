import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Début du peuplement de la base...");

  // --- 1. Création d'une catégorie ---
  const existingCategory = await prisma.category.findUnique({
    where: { name: "Appartement de luxe" },
  });

  const category =
    existingCategory ||
    (await prisma.category.create({
      data: {
        name: "Appartement de luxe",
        descriptionCategory: "Des logements d'exception.",
        CategoryPictures: faker.image.url(),
      },
    }));

  // --- 2. Création d'un utilisateur ---
  const passwordHash = await bcrypt.hash("MotDePasse123!", 10);
  const user = await prisma.users.create({
    data: {
      login: faker.internet.userName(),
      password: passwordHash,
      lastname: faker.person.lastName(),
      firstname: faker.person.firstName(),
      email: faker.internet.email(),
      isadmin: false,
    },
  });

  // --- 3. Création des annonces ---
  for (let i = 0; i < 10; i++) {
    // Générer des dates disponibles aléatoires
    const today = new Date();
    const dates = [];
    for (let j = 0; j < 5; j++) {
      const futureDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + faker.number.int({ min: 1, max: 60 })
      );
      dates.push(futureDate);
    }

    await prisma.annonces.create({
      data: {
        Title: faker.lorem.words(3),
        Description: faker.lorem.sentence(),
        Price: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
        Covers: [faker.image.url(), faker.image.url()],
        Tags: [faker.commerce.productAdjective(), "Voyage"],
        Equipments: ["WiFi", "Cuisine", "Climatisation"],
        Locations: faker.location.city(),
        nbGuest: faker.number.int({ min: 1, max: 6 }),
        firstDate: dates[0],
        dates: dates,
        userId: user.id,
        categoryId: category.id,
      },
    });
  }

  console.log("Base de données peuplée avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
