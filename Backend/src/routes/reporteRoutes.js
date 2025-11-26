// Backend/src/routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getHistorialCambiosCompleto } = require('../controllers/reporteController');

// Ruta de prueba para obtener todos los datos de historial_cambios (protegida por autenticación)
router.get('/reportes/prueba-historial', authMiddleware, getHistorialCambiosCompleto);

module.exports = router;