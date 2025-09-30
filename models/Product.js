import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true },
        precio: { type: Number, required: true },
        categoria: { type: String, required: true },
        colores: [String],
        images: [String],
        tamano: [String],
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
