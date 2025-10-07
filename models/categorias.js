import mongoose from "mongoose";

const categoriasSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true },
    },
    { timestamps: true }
);

const Categorias = mongoose.model("categorias", categoriasSchema);

export default Categorias;
