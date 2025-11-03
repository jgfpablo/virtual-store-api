import multer from "multer";

// Usamos almacenamiento en memoria para subir a Cloudinary desde buffer
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por archivo
});
