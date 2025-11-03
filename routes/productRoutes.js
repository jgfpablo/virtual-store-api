import express from "express";
import Product from "../models/Product.js";
import { upload } from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// 🔎 Utilidad para sanitizar búsquedas por texto
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// 📌 BÚSQUEDAS

router.get("/search", async (req, res) => {
    try {
        const term = req.query.q ? String(req.query.q).trim() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        if (!term) {
            return res
                .status(400)
                .json({ message: "Falta el parámetro de búsqueda" });
        }

        const regex = new RegExp(escapeRegex(term), "i");

        const total = await Product.countDocuments({
            nombre: { $regex: regex },
        });
        const products = await Product.find(
            { nombre: { $regex: regex } },
            {
                nombre: 1,
                precio: 1,
                descripcion: 1,
                images: { $slice: 1 },
            }
        )
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
        });
    } catch (error) {
        console.error("Error buscando productos:", error);
        res.status(500).json({ message: "Error al buscar productos" });
    }
});

router.get("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;
        const product = await Product.findOne({ nombre });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/categoria/:categoria", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const { categoria } = req.params;

        const filtro = {
            categoria: { $regex: new RegExp(`^${categoria}$`, "i") },
        };

        const total = await Product.countDocuments(filtro);

        const products = await Product.find(filtro, {
            nombre: 1,
            precio: 1,
            descripcion: 1,
            images: { $slice: 1 },
        })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
        });
    } catch (err) {
        console.error("Error en /categoria:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 LECTURA

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();

        const products = await Product.find(
            {},
            {
                nombre: 1,
                precio: 1,
                descripcion: 1,
                images: { $slice: 1 },
            }
        )
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(product);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "ID inválido" });
        }
        res.status(500).json({ error: err.message });
    }
});

// 📌 CREACIÓN CON CLOUDINARY

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
                                if (err) {
                                    console.error(
                                        "❌ Error en Cloudinary:",
                                        err
                                    );
                                    return reject(err);
                                }
                                resolve(result);
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

// 📌 EDICIÓN

router.put("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;
        const updates = req.body;

        const updated = await Product.findOneAndUpdate({ nombre }, updates, {
            new: true,
        });

        if (!updated) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updated = await Product.findByIdAndUpdate(id, updates, {
            new: true,
        });

        if (!updated) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 ELIMINACIÓN

router.delete("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;
        const deleted = await Product.findOneAndDelete({ nombre });

        if (!deleted) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
