import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting population...");

  // 1. Create a Category first
  const category = await prisma.category.create({
    data: {
      name: "Appartement de luxe",
      descriptionCategory: "Des logements d'exception.",
      CategoryPictures: faker.image.url(),
    },
  });

  // 2. Create a User
  const user = await prisma.users.create({
    data: {
      login: faker.internet.username(),
      password: "hashed_password_here",
      lastname: faker.person.lastName(),
      firstname: faker.person.firstName(),
      email: faker.internet.email(),
      isadmin: false,
    },
  });

  // 3. Now create the Annonces using the IDs from above
  for (let i = 0; i < 10; i++) {
    await prisma.annonces.create({
      data: {
        Title: faker.lorem.words(3),
        Description: faker.lorem.sentence(),
        Price: parseFloat(faker.commerce.price()),
        Covers: faker.image.url(),
        Tags: [faker.commerce.productAdjective(), "Voyage"],
        Equipments: ["WiFi", "Cuisine"],
        Locations: faker.location.city(),
        // These fields must match the variables created above
        userId: user.id,
        categoryId: category.id,
      },
    });
  }

  console.log("Base peuplée avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
