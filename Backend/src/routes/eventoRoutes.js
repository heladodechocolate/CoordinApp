// coordinapp-backend/src/routes/eventoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getEventos, 
  getEventoById, 
  getTareaById, 
  getTareasPorEvento, // Añadimos la nueva función
  crearEvento, 
  actualizarEvento, 
  cancelarEvento, 
  getHistorialEvento, 
  getTareasReportadas,
  getDetallesTareasReportadas,
  getReporteById, 
  marcarReporteComoRevisado,
  solucionarReporte,
  getTareasSolucionadas,
  getSolucionTarea, // Añadimos la nueva función
  getSolucionByTareaId,
} = require('../controllers/eventoController');

// Ruta para obtener todos los eventos
router.get('/eventos', getEventos);

// Ruta para obtener un evento específico con todos sus detalles
router.get('/eventos/:id', getEventoById);

// Ruta para obtener las tareas de un evento específico
router.get('/eventos/:id/tareas', authMiddleware, getTareasPorEvento);

// Ruta para obtener una tarea específica
router.get('/tareas/:id', getTareaById);

// Ruta para crear un nuevo evento (protegida por autenticación)
router.post('/eventos', authMiddleware, crearEvento);

// Ruta para actualizar un evento existente (protegida por autenticación)
router.put('/eventos/:id', authMiddleware, actualizarEvento);

// Ruta para cancelar un evento (protegida por autenticación)
router.put('/eventos/:id/cancelar', authMiddleware, cancelarEvento);

// Ruta para obtener el historial completo de un evento
router.get('/eventos/:id/historial', authMiddleware, getHistorialEvento);

// Ruta para obtener tareas reportadas (protegida por autenticación)
router.get('/reportes/tareas-reportadas', authMiddleware, getTareasReportadas);

// Ruta para obtener detalles de tareas reportadas (protegida por autenticación)
router.get('/reportes/detalles-tareas-reportadas', authMiddleware, getDetallesTareasReportadas);

// Ruta para obtener un reporte específico (protegida por autenticación)
router.get('/reportes/:id', authMiddleware, getReporteById);

// Ruta para marcar un reporte como revisado (protegida por autenticación)
router.put('/reportes/:id/revisado', authMiddleware, marcarReporteComoRevisado);

// Ruta para solucionar un reporte (protegida por autenticación)
router.put('/reportes/:id/solucionar', authMiddleware, solucionarReporte);

// Ruta para obtener tareas solucionadas (protegida por autenticación)
router.get('/tareas/solucionadas', authMiddleware, getTareasSolucionadas);

// NUEVA RUTA: Obtener la solución de una tarea específica
router.get('/tareas/:id/solucion', authMiddleware, getSolucionTarea);

// NUEVA RUTA ROBUSTA: Obtener la solución de una tarea específica
router.get('/tareas/:id/solucion-directa', authMiddleware, getSolucionByTareaId);

module.exports = router;