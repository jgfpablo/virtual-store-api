import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productsRoutes from "./routes/productRoutes.js";
import categoriasRoutes from "./routes/categoriasRoutes.js";
import cors from "cors";

dotenv.config(); // ✅ primero, para usar process.env

const app = express();

// CORS: permitir solo a tu frontend
app.use(
    cors({
        origin: "http://localhost:4200",
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/api/products", productsRoutes);
app.use("/api/categorias", categoriasRoutes);

// Conexión a MongoDB y levantar servidor
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB");
        app.listen(PORT, () =>
            console.log(`Servidor corriendo en puerto ${PORT}`)
        );
    })
    .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));
