// coordinapp-backend/src/controllers/tareaController.js
const db = require("../db");

// Función para obtener todas las tareas de un evento específico
const getTareasPorEvento = async (req, res) => {
  const { id_evento } = req.params;

  try {
    // Consulta para obtener las tareas del evento con el nombre del departamento
    // --- CORRECCIÓN: Añadimos t.id_evento y t.id_departamento_asignado al SELECT ---
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

// Función para cambiar el estado de una tarea a "terminado"
const completarTarea = async (req, res) => {
  const { id_tarea } = req.params; // Obtenemos el ID de la tarea desde la URL
  const { id_usuario } = req.body; // Obtenemos el ID del usuario que la completa

  console.log(
    `Intentando completar tarea ${id_tarea} por usuario ${id_usuario}`
  );

  try {
    // Primero, verificamos que la tarea existe y obtenemos su estado actual
    const tareaResult = await db.query(
      "SELECT estado, id_evento FROM tareas WHERE id = $1",
      [id_tarea]
    );

    if (tareaResult.rows.length === 0) {
      console.log(`Tarea ${id_tarea} no encontrada`);
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const estadoActual = tareaResult.rows[0].estado;
    console.log(`Estado actual de la tarea: ${estadoActual}`);

    // Actualizamos el estado de la tarea a "terminado" en la base de datos
    await db.query(
      "UPDATE tareas SET estado = $1, id_usuario_completa = $2 WHERE id = $3",
      ["terminado", id_usuario, id_tarea]
    );

    console.log(`Tarea ${id_tarea} actualizada correctamente`);

    // Guardamos un registro de este cambio en historial_tareas
    try {
      await db.query(
        `INSERT INTO historial_tareas (id_tarea, id_usuario, accion, fecha_cambio)
                 VALUES ($1, $2, $3, NOW())`,
        [
          id_tarea,
          id_usuario,
          `Estado cambiado de "${estadoActual}" a "terminado"`,
        ]
      );
      console.log(
        `Historial de tarea ${id_tarea} guardado correctamente en historial_tareas`
      );
    } catch (historialError) {
      console.error("Error al guardar en historial_tareas:", historialError);
      // No devolvemos error aquí, ya que la tarea principal se completó
    }

    // Guardamos un registro detallado en historial_cambios (ajustado a tu estructura)
    try {
      await db.query(
        `INSERT INTO historial_cambios (id_tarea, id_usuario, tipo_cambio, accion, detalles, fecha_cambio)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id_tarea,
          id_usuario,
          "estado",
          `Cambiado de "${estadoActual}" a "terminado"`,
          "Tarea completada exitosamente"
        ]
      );
      console.log(
        `Historial detallado de tarea ${id_tarea} guardado correctamente en historial_cambios`
      );
    } catch (historialError) {
      console.error("Error al guardar en historial_cambios:", historialError);
      // No devolvemos error aquí, ya que la tarea principal se actualizó
    }

    res.json({ message: "Tarea completada exitosamente" });
  } catch (error) {
    console.error("Error al completar la tarea:", error);
    res
      .status(500)
      .json({ message: "Error al completar la tarea", error: error.message });
  }
};

// Función para reportar una tarea con motivo y descripción
const reportarTarea = async (req, res) => {
  const { id_tarea } = req.params; // Obtenemos el ID de la tarea desde la URL
  const { id_usuario, motivo, descripcion } = req.body; // Obtenemos los datos del formulario

  console.log(
    `Intentando reportar tarea ${id_tarea} por usuario ${id_usuario}`
  );

  try {
    // Primero, verificamos que la tarea existe y obtenemos su estado actual
    const tareaResult = await db.query(
      "SELECT estado, id_evento FROM tareas WHERE id = $1",
      [id_tarea]
    );

    if (tareaResult.rows.length === 0) {
      console.log(`Tarea ${id_tarea} no encontrada`);
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const estadoActual = tareaResult.rows[0].estado;
    console.log(`Estado actual de la tarea: ${estadoActual}`);

    // Actualizamos el estado de la tarea a "reportado" en la base de datos
    await db.query(
      "UPDATE tareas SET estado = $1, id_usuario_completa = $2 WHERE id = $3",
      ["reportado", id_usuario, id_tarea]
    );

    console.log(`Tarea ${id_tarea} actualizada correctamente`);

    // Guardamos un registro de este cambio en historial_tareas
    try {
      await db.query(
        `INSERT INTO historial_tareas (id_tarea, id_usuario, accion, fecha_cambio)
                 VALUES ($1, $2, $3, NOW())`,
        [
          id_tarea,
          id_usuario,
          `Estado cambiado de "${estadoActual}" a "reportado"`,
        ]
      );
      console.log(
        `Historial de tarea ${id_tarea} guardado correctamente en historial_tareas`
      );
    } catch (historialError) {
      console.error("Error al guardar en historial_tareas:", historialError);
      // No devolvemos error aquí, ya que la tarea principal se actualizó
    }

    // Guardamos un registro detallado en historial_cambios (ajustado a tu estructura)
    try {
      await db.query(
        `INSERT INTO historial_cambios (id_tarea, id_usuario, tipo_cambio, accion, detalles, fecha_cambio)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id_tarea,
          id_usuario,
          "estado",
          `Cambiado de "${estadoActual}" a "reportado"`,
          `Motivo: ${motivo}. Descripción: ${descripcion}`
        ]
      );
      console.log(
        `Historial detallado de tarea ${id_tarea} guardado correctamente en historial_cambios`
      );
    } catch (historialError) {
      console.error("Error al guardar en historial_cambios:", historialError);
      // No devolvemos error aquí, ya que la tarea principal se actualizó
    }

    res.json({ message: "Tarea reportada exitosamente" });
  } catch (error) {
    console.error("Error al reportar la tarea:", error);
    res
      .status(500)
      .json({ message: "Error al reportar la tarea", error: error.message });
  }
};

// Función para obtener una tarea específica con toda su información
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