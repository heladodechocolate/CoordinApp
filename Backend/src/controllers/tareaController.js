// coordinapp-backend/src/controllers/tareaController.js
const db = require("../db");

// Función para obtener todas las tareas de un evento específico
const getTareasPorEvento = async (req, res) => {
  const { id_evento } = req.params;

  try {
    // Consulta para obtener las tareas del evento con el nombre del departamento
    const result = await db.query(
      `SELECT t.id, t.descripcion, t.estado, t.id_evento, t.id_departamento_asignado, d.nombre AS nombre_departamento
             FROM tareas t
             JOIN departamento d ON t.id_departamento_asignado = d.id
             WHERE t.id_evento = $1
             ORDER BY d.nombre, t.id`,
      [id_evento]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las tareas del evento" });
  }
};

// FUNCIÓN CLAVE: Completar una tarea (CORREGIDA)
const completarTarea = async (req, res) => {
  const { id_tarea } = req.params; // ID de la tarea desde la URL
  const { id_usuario } = req.body; // ID del usuario que la completa

  console.log(`>>> INICIANDO completarTarea para tarea ID: ${id_tarea} por usuario ID: ${id_usuario}`);

  try {
    // 1. OBTENER EL ESTADO ACTUAL DE LA TAREA (PASO CRÍTICO)
    console.log(`>>> Paso 1: Obteniendo estado actual de la tarea ${id_tarea}`);
    const tareaResult = await db.query(
      "SELECT estado, id_evento FROM tareas WHERE id = $1",
      [id_tarea]
    );

    if (tareaResult.rows.length === 0) {
      console.log(`>>> ERROR: Tarea ${id_tarea} no encontrada`);
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const estadoActual = tareaResult.rows[0].estado;
    console.log(`>>> Estado actual de la tarea: "${estadoActual}"`);

    // Verificar si la tarea ya está en estado "terminado"
    if (estadoActual === "terminado") {
      console.log(`>>> ADVERTENCIA: La tarea ${id_tarea} ya está en estado 'terminado'`);
      return res.status(400).json({ message: "Esta tarea ya ha sido completada anteriormente" });
    }

    // 2. ACTUALIZAR EL ESTADO DE LA TAREA A "terminado"
    console.log(`>>> Paso 2: Actualizando estado de la tarea a "terminado"`);
    await db.query(
      "UPDATE tareas SET estado = $1, id_usuario_completa = $2 WHERE id = $3",
      ["terminado", id_usuario, id_tarea]
    );
    console.log(`>>> Tarea ${id_tarea} actualizada correctamente a 'terminado'`);

    // 3. REGISTRAR EN historial_tareas
    try {
      const accionHistorial = `Estado cambiado de "${estadoActual}" a "terminado"`;
      console.log(`>>> Paso 3: Registrando en historial_tareas: "${accionHistorial}"`);
      
      await db.query(
        `INSERT INTO historial_tareas (id_tarea, id_usuario, accion, fecha_cambio)
                 VALUES ($1, $2, $3, NOW())`,
        [id_tarea, id_usuario, accionHistorial]
      );
      console.log(`>>> Historial de tarea ${id_tarea} guardado correctamente en historial_tareas`);
    } catch (historialError) {
      console.error(">>> ERROR al guardar en historial_tareas:", historialError);
    }

    // 4. REGISTRAR EN historial_cambios
    try {
      const accionCambios = `Cambiado de "${estadoActual}" a "terminado"`;
      console.log(`>>> Paso 4: Registrando en historial_cambios: "${accionCambios}"`);
      
      await db.query(
        `INSERT INTO historial_cambios (id_tarea, id_usuario, tipo_cambio, accion, detalles, fecha_cambio)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id_tarea,
          id_usuario,
          "estado",
          accionCambios,
          "Tarea completada exitosamente"
        ]
      );
      console.log(`>>> Historial detallado de tarea ${id_tarea} guardado correctamente en historial_cambios`);
    } catch (historialError) {
      console.error(">>> ERROR al guardar en historial_cambios:", historialError);
    }

    res.json({ message: "Tarea completada exitosamente" });
  } catch (error) {
    console.error(">>> ERROR GENERAL al completar la tarea:", error);
    res.status(500).json({ message: "Error al completar la tarea", error: error.message });
  }
};

// Función para reportar una tarea con motivo y descripción
const reportarTarea = async (req, res) => {
  const { id_tarea } = req.params; // ID de la tarea desde la URL
  const { id_usuario, motivo, descripcion } = req.body; // Datos del formulario

  console.log(`>>> INICIANDO reportarTarea para tarea ID: ${id_tarea} por usuario ID: ${id_usuario}`);

  try {
    // 1. OBTENER EL ESTADO ACTUAL DE LA TAREA
    console.log(`>>> Paso 1: Obteniendo estado actual de la tarea ${id_tarea}`);
    const tareaResult = await db.query(
      "SELECT estado, id_evento FROM tareas WHERE id = $1",
      [id_tarea]
    );

    if (tareaResult.rows.length === 0) {
      console.log(`>>> ERROR: Tarea ${id_tarea} no encontrada`);
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const estadoActual = tareaResult.rows[0].estado;
    console.log(`>>> Estado actual de la tarea: "${estadoActual}"`);

    // 2. ACTUALIZAR EL ESTADO DE LA TAREA A "reportado"
    console.log(`>>> Paso 2: Actualizando estado de la tarea a "reportado"`);
    await db.query(
      "UPDATE tareas SET estado = $1, id_usuario_completa = $2 WHERE id = $3",
      ["reportado", id_usuario, id_tarea]
    );
    console.log(`>>> Tarea ${id_tarea} actualizada correctamente a "reportado"`);

    // 3. REGISTRAR EN historial_tareas
    try {
      const accionHistorial = `Estado cambiado de "${estadoActual}" a "reportado"`;
      console.log(`>>> Paso 3: Registrando en historial_tareas: "${accionHistorial}"`);
      
      await db.query(
        `INSERT INTO historial_tareas (id_tarea, id_usuario, accion, fecha_cambio)
                 VALUES ($1, $2, $3, NOW())`,
        [id_tarea, id_usuario, accionHistorial]
      );
      console.log(`>>> Historial de tarea ${id_tarea} guardado correctamente en historial_tareas`);
    } catch (historialError) {
      console.error(">>> ERROR al guardar en historial_tareas:", historialError);
    }

    // 4. REGISTRAR EN historial_cambios
    try {
      const accionCambios = `Cambiado de "${estadoActual}" a "reportado"`;
      const detalles = `Motivo: ${motivo}. Descripción: ${descripcion}`;
      console.log(`>>> Paso 4: Registrando en historial_cambios: "${accionCambios}"`);
      
      await db.query(
        `INSERT INTO historial_cambios (id_tarea, id_usuario, tipo_cambio, accion, detalles, fecha_cambio)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id_tarea,
          id_usuario,
          "estado",
          accionCambios,
          detalles
        ]
      );
      console.log(`>>> Historial detallado de tarea ${id_tarea} guardado correctamente en historial_cambios`);
    } catch (historialError) {
      console.error(">>> ERROR al guardar en historial_cambios:", historialError);
    }

    res.json({ message: "Tarea reportada exitosamente" });
  } catch (error) {
    console.error(">>> ERROR GENERAL al reportar la tarea:", error);
    res.status(500).json({ message: "Error al reportar la tarea", error: error.message });
  }
};

// Función para obtener una tarea específica con su información
const getTareaById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT t.id, t.descripcion, t.estado, t.id_evento, t.id_departamento_asignado, 
                    t.id_usuario_completa, d.nombre AS nombre_departamento, e.titulo AS evento_titulo
             FROM tareas t
             JOIN departamento d ON t.id_departamento_asignado = d.id
             JOIN eventos e ON t.id_evento = e.id
             WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la tarea" });
  }
};

// Exportamos todas las funciones
module.exports = {
  getTareasPorEvento,
  completarTarea,
  reportarTarea,
  getTareaById,
};