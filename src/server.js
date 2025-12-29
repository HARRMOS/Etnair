import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import annoncesRoutes from "./routes/annonces.route.js";
import categoryRoutes from "./routes/category.routes.js";
import companyRoutes from "./routes/company.route.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// JSON uniquement pour routes normales (PATCH, POST JSON, GET)

// Routes
app.use("/users", usersRoutes);
app.use("/annonces", annoncesRoutes);

app.use("/category", categoryRoutes);
app.use("/company", companyRoutes);

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));
