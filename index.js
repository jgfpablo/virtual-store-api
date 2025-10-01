import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productsRoutes from "./routes/productRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(
    cors({
        origin: "http://localhost:4200",
    })
);

app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Rutas
app.use("/api/products", productsRoutes);

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB");
        // Levantamos el servidor solo si se conecta a la DB
        app.listen(PORT, () =>
            console.log(`Servidor corriendo en puerto ${PORT}`)
        );
    })
    .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));
