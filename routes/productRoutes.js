import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Buscar productos por texto (nombre)
router.get("/search", async (req, res) => {
    try {
        const term = req.query.q ? String(req.query.q).trim() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        if (!term) {
            return res
                .status(400)
                .json({ message: "Falta el parámetro de búsqueda" });
        }

        const regex = new RegExp(term, "i");

        const total = await Product.countDocuments({
            nombre: { $regex: regex },
        });
        const products = await Product.find({ nombre: { $regex: regex } })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error buscando productos:", error);
        res.status(500).json({ message: "Error al buscar productos" });
    }
});

// GET todos los productos
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Página actual
        const limit = parseInt(req.query.limit) || 6; // Productos por página
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();

        const products = await Product.find(
            {},
            {
                images: { $slice: 1 }, // 👈 solo la primera imagen
            }
        )
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            total, // total de productos
            page, // página actual
            totalPages: Math.ceil(total / limit),
            limit,
            products, // array con los productos de esta página
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST crear un producto
router.post("/", async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const saved = await newProduct.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Buscar producto por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // 🔎 Usar findById directamente en lugar de findOne({ _id: id })
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(product);
    } catch (err) {
        // ⚠️ Si el id no tiene formato válido, lanzará un CastError de Mongoose
        if (err.name === "CastError") {
            return res.status(400).json({ message: "ID inválido" });
        }
        res.status(500).json({ error: err.message });
    }
});

// Buscar producto por nombre
router.get("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;
        const product = await Product.findOne({ nombre: nombre });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar producto por category s
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
            images: { $slice: 1 }, // 👈 solo la primera imagen
        })
            .skip(skip)
            .limit(limit);

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

// Editar producto por nombre
router.put("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;
        const updates = req.body;

        const updated = await Product.findOneAndUpdate(
            { nombre: nombre },
            updates,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Editar por id
router.put("/id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updated = await Product.findByIdAndUpdate(
            id, // le pasás directamente el _id
            updates,
            { new: true } // devuelve el documento ya actualizado
        );

        if (!updated) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar producto por nombre
router.delete("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;

        const deleted = await Product.findOneAndDelete({ nombre: nombre });

        if (!deleted) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar producto por id
router.delete("/id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        res.json({ msg: "Producto eliminado", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// router.get("/search", async (req, res) => {
//     try {
//         const term = req.query.q ? String(req.query.q) : "";
//         const page = parseInt(String(req.query.page)) || 1;
//         const limit = parseInt(String(req.query.limit)) || 6;

//         const regex = new RegExp(escapeRegex(term), "i");

//         const products = await Product.find({ nombre: { $regex: regex } })
//             .skip((page - 1) * limit)
//             .limit(limit);

//         const total = await Product.countDocuments({
//             nombre: { $regex: regex },
//         });

//         res.json({
//             products,
//             total,
//             totalPages: Math.ceil(total / limit),
//             currentPage: page,
//         });
//     } catch (error) {
//         console.error("Error buscando productos:", error);
//         res.status(500).json({ message: "Error al buscar productos" });
//     }
// });

export default router;
