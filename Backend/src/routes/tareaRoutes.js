// coordinapp-backend/src/routes/tareaRoutes.js
const express = require('express');
const router = express.Router();
// Importamos todas las funciones que necesitamos del controlador
const { getTareasPorEvento, completarTarea, reportarTarea } = require('../controllers/tareaController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- Asegúrate de importar esto

// Ruta para obtener las tareas de un evento específico
router.get('/eventos/:id_evento/tareas', getTareasPorEvento);

// Ruta para completar una tarea específica (protegida)
router.put('/tareas/:id_tarea/completar', authMiddleware, completarTarea); // <-- Asegúrate de que authMiddleware esté aquí

// Ruta para reportar una tarea específica (protegida)
router.put('/tareas/:id_tarea/reportar', authMiddleware, reportarTarea);

module.exports = router;