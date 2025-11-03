// 🌐 Core & terceros
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// 📁 Rutas
import productsRoutes from "./routes/productRoutes.js";
import categoriasRoutes from "./routes/categoriasRoutes.js";

// ✅ Configuración de entorno cosas
dotenv.config();

const app = express();

// ✅ CORS
const allowedOrigins = [
    "http://localhost:4200", // desarrollo local
    "https://noctura.netlify.app", // producción en Netlify
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // Postman, etc.
            if (allowedOrigins.includes(origin)) return callback(null, true);
            console.log("❌ Bloqueado por CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Rutas
app.use("/api/products", productsRoutes);
app.use("/api/categorias", categoriasRoutes);

// ✅ Conexión a MongoDB y levantar servidor
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB");
        app.listen(PORT, () =>
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
        );
    })
    .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));
