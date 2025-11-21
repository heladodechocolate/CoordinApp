// coordinapp-backend/src/routes/eventoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getEventos, getEventoById, getTareaById, crearEvento, actualizarEvento, getHistorialEvento } = require('../controllers/eventoController'); // <-- AÑADE getHistorialEvento

// Ruta para obtener todos los eventos
router.get('/eventos', getEventos);

// Ruta para obtener un evento específico con todos sus detalles
router.get('/eventos/:id', getEventoById);

// NUEVO: Ruta para obtener el historial completo de un evento
router.get('/eventos/:id/historial', authMiddleware, getHistorialEvento); // <-- AÑADE ESTA LÍNEA

// Ruta para obtener una tarea específica
router.get('/tareas/:id', getTareaById);

// Ruta para crear un nuevo evento (protegida por autenticación)
router.post('/eventos', authMiddleware, crearEvento);

// Ruta para actualizar un evento existente (protegida por autenticación)
router.put('/eventos/:id', authMiddleware, actualizarEvento);

module.exports = router;