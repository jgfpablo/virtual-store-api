import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true },
        precio: { type: Number, required: true },
        categoria: { type: String, required: true },
        colores: [String],
        images: [String],
        ancho: { type: String },
        alto: { type: String },
        grosor: { type: String },
        material: { type: String },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
