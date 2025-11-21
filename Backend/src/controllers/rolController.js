// Backend/src/controllers/rolController.js
const db = require('../db');

// Función para obtener todos los roles
const getRoles = async (req, res) => {
    try {
        const result = await db.query('SELECT id, nombre_rol FROM roles ORDER BY nombre_rol ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
};

module.exports = { getRoles };