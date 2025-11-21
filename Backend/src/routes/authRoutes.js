const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

// Ruta para el inicio de sesión
router.post('/login', login);

// Ruta para el registro de nuevos usuarios
router.post('/register', register); // <-- AÑADE ESTA LÍNEA

module.exports = router;