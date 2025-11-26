// Backend/src/controllers/reporteController.js
const db = require('../db');

// Función de prueba para obtener todos los datos de historial_cambios
const getHistorialCambiosCompleto = async (req, res) => {
  try {
    // Consulta simple para obtener todos los datos de historial_cambios
    const result = await db.query('SELECT * FROM historial_cambios');
    
    // Devolvemos los resultados y también los mostramos en la consola del servidor
    console.log('Datos de historial_cambios:', result.rows);
    
    res.json({
      message: 'Consulta ejecutada correctamente',
      totalRegistros: result.rows.length,
      datos: result.rows
    });
  } catch (error) {
    console.error("Error al obtener historial_cambios:", error);
    res.status(500).json({ 
      message: "Error al obtener los datos de historial_cambios",
      error: error.message 
    });
  }
};

module.exports = { getHistorialCambiosCompleto };