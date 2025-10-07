import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET todos los productos
router.get("/", async (res) => {
    try {
        const categorias = await Product.find();
        res.json({
            categorias, // array con los productos de esta página
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//crear categoria
router.post("/", async (req, res) => {
    try {
        const newCategorias = new Product(req.body);
        const saved = await newCategorias.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;

        const deleted = await Product.findOneAndDelete({ nombre: nombre });

        if (!deleted) {
            return res.status(404).json({ message: "Categoria no encontrado" });
        }

        res.json({ message: "Categoria eliminado correctamente", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
