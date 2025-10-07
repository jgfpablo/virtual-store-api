import express from "express";
import Categorias from "../models/categorias.js";

const router = express.Router();

// GET todas las categorías
router.get("/", async (req, res) => {
    try {
        const categorias = await Categorias.find();
        res.json({ categorias });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear categoría
router.post("/", async (req, res) => {
    try {
        const newCategoria = new Categorias(req.body);
        const saved = await newCategoria.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Eliminar categoría por nombre
router.delete("/nombre/:nombre", async (req, res) => {
    try {
        const { nombre } = req.params;
        const deleted = await Categorias.findOneAndDelete({ nombre });

        if (!deleted) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        res.json({ message: "Categoría eliminada correctamente", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
