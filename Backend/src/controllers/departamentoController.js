// Backend/src/controllers/departamentoController.js
const db = require('../db');

// Función para obtener todos los departamentos
const getDepartamentos = async (req, res) => {
    try {
        const result = await db.query('SELECT id, nombre FROM departamento ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los departamentos' });
    }
};

module.exports = { getDepartamentos };