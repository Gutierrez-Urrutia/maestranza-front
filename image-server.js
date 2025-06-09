const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Asegurar que la carpeta public existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Configurar multer para guardar directamente en public
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicDir);
    },
    filename: function (req, file, cb) {
        // Usar el nombre que viene del frontend
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    }
});

// Endpoint para subir imágenes
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ningún archivo'
            });
        }

        res.json({
            success: true,
            message: 'Imagen subida exitosamente',
            filename: req.file.filename,
            url: `/${req.file.filename}`
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande (máximo 5MB)'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
    });
});

app.listen(port, () => {
    console.log(`🚀 Servidor de imágenes ejecutándose en http://localhost:${port}`);
    console.log(`📁 Guardando imágenes en: ${publicDir}`);
});