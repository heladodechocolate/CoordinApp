// coordinapp-backend/src/routes/eventoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getEventos, getEventoById, getTareaById, crearEvento, actualizarEvento, cancelarEvento, getHistorialEvento, getTareasReportadas, marcarReporteComoRevisado} = require('../controllers/eventoController'); // <-- AÑADE getTareasReportadas

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

// NUEVA RUTA: Ruta para cancelar un evento (protegida por autenticación)
router.put('/eventos/:id/cancelar', authMiddleware, cancelarEvento); // <-- AÑADE ESTA LÍNEA

// Ruta para obtener tareas reportadas (protegida por autenticación)
router.get('/reportes/tareas-reportadas', authMiddleware, getTareasReportadas); // <-- AÑADE ESTA LÍNEA

// Ruta para marcar un reporte como revisado (protegida por autenticación)
router.put('/reportes/:id/revisado', authMiddleware, marcarReporteComoRevisado);

module.exports = router;