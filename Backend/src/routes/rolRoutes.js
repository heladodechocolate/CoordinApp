// Backend/src/routes/rolRoutes.js
const express = require('express');
const router = express.Router();
const { getRoles } = require('../controllers/rolController');

// Ruta para obtener todos los roles
router.get('/roles', getRoles);

module.exports = router;