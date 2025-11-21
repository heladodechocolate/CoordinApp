// Backend/src/routes/espacioRoutes.js
const express = require('express');
const router = express.Router();
const { getEspacios } = require('../controllers/espacioController');

// Ruta para obtener todos los espacios
router.get('/espacios', getEspacios);

module.exports = router;