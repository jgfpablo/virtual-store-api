import express from "express";
import Product from "../models/Product.js";
import { upload } from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.post("/", upload.array("images"), async (req, res) => {
    try {
        console.log("🟡 req.body:", req.body);
        console.log("🟡 req.files:", req.files);

        const { nombre, descripcion, precio, categoria } = req.body;
        if (!nombre || !descripcion || !precio || !categoria) {
            return res
                .status(400)
                .json({ error: "Faltan campos obligatorios" });
        }

        const imageUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            { resource_type: "image" },
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            }
                        )
                        .end(file.buffer);
                });

                imageUrls.push(result.secure_url);
            }
        }

        let colores = [];
        if (Array.isArray(req.body.colores)) {
            colores = req.body.colores;
        } else if (typeof req.body.colores === "string") {
            colores = req.body.colores
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
        }

        const product = new Product({
            nombre,
            descripcion,
            precio,
            categoria,
            alto: req.body.alto || "",
            ancho: req.body.ancho || "",
            grosor: req.body.grosor || "",
            material: req.body.material || "",
            colores,
            images: imageUrls,
        });

        const saved = await product.save();
        res.status(201).json({ message: "Producto creado", product: saved });
    } catch (err) {
        console.error("❌ Error al crear producto:", err.message);
        console.error("❌ Stack:", err.stack);
        res.status(500).json({
            error: err.message || "Error al crear producto",
        });
    }
});

export default router;
