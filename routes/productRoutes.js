import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET todos los productos
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
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
router.get("/product/:id", async (req, res) => {
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

export default router;
