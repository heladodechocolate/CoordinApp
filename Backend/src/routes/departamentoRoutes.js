// Backend/src/routes/departamentoRoutes.js
const express = require('express');
const router = express.Router();
const { getDepartamentos } = require('../controllers/departamentoController');

// Ruta para obtener todos los departamentos
router.get('/departamentos', getDepartamentos);

module.exports = router;