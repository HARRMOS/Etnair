// src/server.js
import express from "express";
import usersRoutes from "./routes/users.routes.js";
import annoncesRoutes from "./routes/annonces.route.js";
import categoryRoutes from "./routes/category.routes.js";
import companyRoutes from "./routes/company.route.js";

const app = express();

app.use(express.json());

// Routes
app.use("/users", usersRoutes);
app.use("/annonces", annoncesRoutes);
app.use("/category", categoryRoutes);
app.use("/company", companyRoutes);

// Lancement du serveur
app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
