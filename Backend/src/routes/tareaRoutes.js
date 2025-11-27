// coordinapp-backend/src/routes/tareaRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Importamos todas las funciones que necesitamos del controlador
const { getTareasPorEvento, completarTarea, reportarTarea, getTareaById } = require('../controllers/tareaController');

// Ruta para obtener las tareas de un evento específico
router.get('/eventos/:id_evento/tareas', getTareasPorEvento);

// Ruta para obtener una tarea específica
router.get('/tareas/:id', getTareaById);

// Ruta para completar una tarea específica (protegida por autenticación)
router.put('/tareas/:id_tarea/completar', authMiddleware, completarTarea);

// Ruta para reportar una tarea específica (protegida por autenticación)
router.put('/tareas/:id_tarea/reportar', authMiddleware, reportarTarea);

module.exports = router;