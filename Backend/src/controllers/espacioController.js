// Backend/src/controllers/espacioController.js
const db = require('../db');

// Función para obtener todos los espacios
const getEspacios = async (req, res) => {
    try {
        const result = await db.query('SELECT id, nombre FROM espacios ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los espacios' });
    }
};

module.exports = { getEspacios };