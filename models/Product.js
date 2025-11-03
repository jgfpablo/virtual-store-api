import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        // 🏷️ Nombre del producto
        nombre: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },

        // 📝 Descripción comercial
        descripcion: {
            type: String,
            required: true,
            trim: true,
        },

        // 💰 Precio en moneda local
        precio: {
            type: Number,
            required: true,
            min: 0,
        },

        // 🗂️ Categoría (ej: "sillas", "mesas")
        categoria: {
            type: String,
            required: true,
            trim: true,
        },

        // 🎨 Colores disponibles
        colores: {
            type: [String],
            default: [],
        },

        // 🖼️ Imágenes (URLs públicas desde Cloudinary)
        images: {
            type: [String],
            default: [],
        },

        // 📐 Dimensiones (opcional)
        ancho: { type: String, trim: true },
        alto: { type: String, trim: true },
        grosor: { type: String, trim: true },

        // 🪵 Material (opcional)
        material: { type: String, trim: true },
    },
    {
        timestamps: true, // 🕒 createdAt y updatedAt
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
