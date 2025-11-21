// coordinapp-backend/src/routes/tareaRoutes.js
const express = require('express');
const router = express.Router();
// Importamos todas las funciones que necesitamos del controlador
const { getTareasPorEvento, completarTarea, reportarTarea } = require('../controllers/tareaController');

// Ruta para obtener las tareas de un evento específico
router.get('/eventos/:id_evento/tareas', getTareasPorEvento);

// Ruta para completar una tarea específica
router.put('/tareas/:id_tarea/completar', completarTarea);

// Ruta para reportar una tarea específica
router.put('/tareas/:id_tarea/reportar', reportarTarea);

module.exports = router;