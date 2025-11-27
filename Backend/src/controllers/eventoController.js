// coordinapp-backend/src/controllers/eventoController.js
const db = require("../db");

// Función para obtener todos los eventos
const getEventos = async (req, res) => {
  try {
    // Modificamos la consulta para que incluya todos los eventos, incluso los cancelados
    const result = await db.query(
      `SELECT e.id, e.titulo, e.fecha_inicio, e.estado, e.anotaciones, esp.nombre AS nombre_espacio
             FROM eventos e
             JOIN espacios esp ON e.id_espacio = esp.id
             ORDER BY e.fecha_inicio ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los eventos" });
  }
};

// Función para obtener un evento específico con todos sus detalles
const getEventoById = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtenemos la información básica del evento
    const eventoResult = await db.query(
      `SELECT e.id, e.titulo, e.descripcion, e.fecha_inicio, e.estado, 
                    e.id_espacio, e.id_creador, e.anotaciones, esp.nombre AS nombre_espacio,
                    u.nombre AS nombre_creador
             FROM eventos e
             JOIN espacios esp ON e.id_espacio = esp.id
             JOIN usuarios u ON e.id_creador = u.id
             WHERE e.id = $1`,
      [id]
    );

    if (eventoResult.rows.length === 0) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const evento = eventoResult.rows[0];

    // Obtenemos los espacios asociados al evento
    const espaciosResult = await db.query(
      `SELECT esp.id, esp.nombre 
             FROM eventos_espacios ee
             JOIN espacios esp ON ee.id_espacio = esp.id
             WHERE ee.id_evento = $1`,
      [id]
    );

    evento.espacios = espaciosResult.rows;

    // Obtenemos los departamentos asociados al evento
    const departamentosResult = await db.query(
      `SELECT d.id, d.nombre 
             FROM evento_departamento ed
             JOIN departamento d ON ed.id_departamento = d.id
             WHERE ed.id_evento = $1`,
      [id]
    );

    evento.departamentos = departamentosResult.rows;

    // Obtenemos las tareas del evento
    const tareasResult = await db.query(
      `SELECT t.id, t.descripcion, t.estado, t.id_departamento_asignado, 
                    d.nombre AS nombre_departamento
             FROM tareas t
             JOIN departamento d ON t.id_departamento_asignado = d.id
             WHERE t.id_evento = $1
             ORDER BY d.nombre, t.id`,
      [id]
    );

    evento.tareas = tareasResult.rows;

    res.json(evento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el evento" });
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

// NUEVA FUNCIÓN: Obtener tareas de un evento específico
const getTareasPorEvento = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT t.id, t.descripcion, t.estado, t.id_evento, t.id_departamento_asignado, 
                    d.nombre AS nombre_departamento
             FROM tareas t
             JOIN departamento d ON t.id_departamento_asignado = d.id
             WHERE t.id_evento = $1
             ORDER BY d.nombre, t.id`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las tareas del evento" });
  }
};

// Función para crear un evento
const crearEvento = async (req, res) => {
  const { titulo, descripcion, id_espacio, fecha_inicio, anotaciones, tareas } = req.body;
  const id_creador = req.user.id; // Asumimos que el middleware de autenticación pone el usuario en req.user

  // Validación del título
  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ message: 'El título del evento es un campo obligatorio.' });
  }

  // Empezamos una transacción de base de datos para asegurar que todo o nada se guarde
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Crear el evento principal
    const eventoResult = await client.query(
      `INSERT INTO eventos (titulo, descripcion, fecha_inicio, estado, id_espacio, id_creador, anotaciones)
             VALUES ($1, $2, $3, 'pendiente', $4, $5, $6)
             RETURNING id`,
      [titulo, descripcion, fecha_inicio, id_espacio, id_creador, anotaciones]
    );

    const nuevoEventoId = eventoResult.rows[0].id;
    console.log(`Evento ${nuevoEventoId} creado.`);

    // 2. Asociar el espacio al evento (en la tabla intermedia)
    await client.query(
      "INSERT INTO eventos_espacios (id_evento, id_espacio) VALUES ($1, $2)",
      [nuevoEventoId, id_espacio]
    );

    // 3. Recolectar los departamentos únicos de las tareas para la tabla evento_departamento
    const departamentosUnicos = [
      ...new Set(tareas.map((t) => t.id_departamento_asignado)),
    ];

    for (const deptoId of departamentosUnicos) {
      await client.query(
        "INSERT INTO evento_departamento (id_evento, id_departamento) VALUES ($1, $2)",
        [nuevoEventoId, deptoId]
      );
    }

    // 4. Insertar todas las tareas
    for (const tarea of tareas) {
      await client.query(
        `INSERT INTO tareas (descripcion, estado, id_evento, id_departamento_asignado)
                 VALUES ($1, 'pendiente', $2, $3)`,
        [tarea.descripcion, nuevoEventoId, tarea.id_departamento_asignado]
      );
    }

    await client.query("COMMIT");
    console.log(`Transacción para evento ${nuevoEventoId} completada.`);

    res.status(201).json({ message: "Evento creado exitosamente", id: nuevoEventoId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear evento (transacción revertida):", error);
    res.status(500).json({ message: "Error al crear el evento", error: error.message });
  } finally {
    client.release();
  }
};

// Función para actualizar un evento existente
const actualizarEvento = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, id_espacio, fecha_inicio, anotaciones, tareas } = req.body;
  const id_creador = req.user.id;

  // Validación del título
  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ message: 'El título del evento es un campo obligatorio.' });
  }

  // Empezamos una transacción de base de datos
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Actualizar el evento principal
    await client.query(
      `UPDATE eventos 
             SET titulo = $1, descripcion = $2, id_espacio = $3, fecha_inicio = $4, anotaciones = $5
             WHERE id = $6`,
      [titulo, descripcion, id_espacio, fecha_inicio, anotaciones, id]
    );
    console.log(`Evento ${id} actualizado.`);

    // 2. Eliminar las relaciones antiguas de espacios y departamentos
    await client.query("DELETE FROM eventos_espacios WHERE id_evento = $1", [id]);
    await client.query("DELETE FROM evento_departamento WHERE id_evento = $1", [id]);

    // Eliminamos solo las tareas PENDIENTES para no perder el historial de las completadas
    await client.query(
      "DELETE FROM tareas WHERE id_evento = $1 AND estado = 'pendiente'",
      [id]
    );

    // 3. Insertar las nuevas relaciones y tareas (similar a la creación)
    await client.query(
      "INSERT INTO eventos_espacios (id_evento, id_espacio) VALUES ($1, $2)",
      [id, id_espacio]
    );

    const departamentosUnicos = [
      ...new Set(tareas.map((t) => t.id_departamento_asignado)),
    ];
    for (const deptoId of departamentosUnicos) {
      await client.query(
        "INSERT INTO evento_departamento (id_evento, id_departamento) VALUES ($1, $2)",
        [id, deptoId]
      );
    }

    for (const tarea of tareas) {
      await client.query(
        `INSERT INTO tareas (descripcion, estado, id_evento, id_departamento_asignado)
                 VALUES ($1, 'pendiente', $2, $3)`,
        [tarea.descripcion, id, tarea.id_departamento_asignado]
      );
    }

    await client.query("COMMIT");
    console.log(`Transacción para evento ${id} completada.`);

    res.json({ message: "Evento actualizado exitosamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar evento (transacción revertida):", error);
    res.status(500).json({ message: "Error al actualizar el evento", error: error.message });
  } finally {
    client.release();
  }
};

// Función para cancelar un evento
const cancelarEvento = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificamos que el evento existe
    const eventoResult = await db.query(
      "SELECT id, estado FROM eventos WHERE id = $1",
      [id]
    );

    if (eventoResult.rows.length === 0) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const estadoActual = eventoResult.rows[0].estado;
    
    // Verificamos que el evento no esté ya cancelado
    if (estadoActual === 'cancelado') {
      return res.status(400).json({ message: "El evento ya está cancelado" });
    }

    // Actualizamos el estado del evento a 'cancelado'
    await db.query(
      "UPDATE eventos SET estado = 'cancelado' WHERE id = $1",
      [id]
    );

    console.log(`Evento ${id} cancelado.`);

    // Añadimos el registro al historial de cambios
    try {
      await db.query(
        `INSERT INTO historial_cambios (id_evento, id_usuario, tipo_cambio, accion, detalles, fecha_cambio)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id,
          req.user.id,
          'estado',
          'Evento cancelado',
          `El estado del evento cambió a 'cancelado'`,
        ]
      );
      console.log(`Historial de cancelación para evento ${id} guardado.`);
    } catch (historialError) {
      console.error("Error al guardar en historial_cambios:", historialError);
    }

    res.json({ message: "Evento cancelado exitosamente" });
  } catch (error) {
    console.error("Error al cancelar evento:", error);
    res.status(500).json({ message: "Error al cancelar el evento", error: error.message });
  }
};

const getHistorialEvento = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtenemos la información básica del evento
    const eventoResult = await db.query(
      `SELECT e.id, e.titulo, e.descripcion, e.fecha_inicio, e.estado, 
                    e.id_espacio, e.id_creador, e.anotaciones, esp.nombre AS nombre_espacio,
                    u.nombre AS nombre_creador
             FROM eventos e
             JOIN espacios esp ON e.id_espacio = esp.id
             JOIN usuarios u ON e.id_creador = u.id
             WHERE e.id = $1`,
      [id]
    );

    if (eventoResult.rows.length === 0) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const evento = eventoResult.rows[0];

    // Obtenemos los departamentos asociados al evento
    const departamentosResult = await db.query(
      `SELECT d.id, d.nombre 
             FROM evento_departamento ed
             JOIN departamento d ON ed.id_departamento = d.id
             WHERE ed.id_evento = $1`,
      [id]
    );

    evento.departamentos = departamentosResult.rows;

    // Obtenemos las tareas del evento y su historial
    const tareasResult = await db.query(
      `SELECT t.id, t.descripcion, t.estado, t.id_departamento_asignado, 
                    d.nombre AS nombre_departamento
             FROM tareas t
             JOIN departamento d ON t.id_departamento_asignado = d.id
             WHERE t.id_evento = $1
             ORDER BY d.nombre, t.id`,
      [id]
    );

    evento.tareas = tareasResult.rows;

    // Obtenemos el historial de tareas y de cambios para cada tarea
    for (const tarea of evento.tareas) {
      // Historial de tareas
      const historialTareasResult = await db.query(
        `SELECT ht.id, ht.id_tarea, ht.id_usuario, ht.accion, ht.fecha_cambio,
                        u.nombre AS nombre_usuario
                 FROM historial_tareas ht
                 JOIN usuarios u ON ht.id_usuario = u.id
                 WHERE ht.id_tarea = $1
                 ORDER BY ht.fecha_cambio DESC`,
        [tarea.id]
      );

      tarea.historial_tareas = historialTareasResult.rows;

      // Historial de cambios
      const historialCambiosResult = await db.query(
        `SELECT hc.id, hc.id_tarea, hc.id_usuario, hc.accion, hc.fecha_cambio,
            hc.tipo_cambio, hc.detalles, u.nombre AS nombre_usuario
     FROM historial_cambios hc
     LEFT JOIN usuarios u ON hc.id_usuario = u.id
     WHERE hc.id_tarea = $1
     ORDER BY hc.fecha_cambio DESC`,
        [tarea.id]
      );
      tarea.historial_cambios = historialCambiosResult.rows;
    }

    res.json(evento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el historial del evento" });
  }
};

// Función para obtener tareas reportadas
const getTareasReportadas = async (req, res) => {
  try {
    // Consulta para obtener las tareas reportadas desde historial_cambios
    const result = await db.query(
      `SELECT hc.id, hc.id_tarea, hc.id_usuario, hc.accion, hc.fecha_cambio, hc.detalles, 
              u.nombre AS nombre_usuario, t.descripcion AS descripcion_tarea, e.titulo AS evento_titulo
       FROM historial_cambios hc
       JOIN usuarios u ON hc.id_usuario = u.id
       JOIN tareas t ON hc.id_tarea = t.id
       JOIN eventos e ON t.id_evento = e.id
       WHERE hc.accion LIKE '%Cambiado de "pendiente" a "reportado"%'
       ORDER BY hc.fecha_cambio DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener tareas reportadas:", error);
    res.status(500).json({ message: "Error al obtener las tareas reportadas" });
  }
};

// NUEVA FUNCIÓN: Obtener detalles de tareas reportadas para la nueva vista
const getDetallesTareasReportadas = async (req, res) => {
  try {
    console.log("Iniciando consulta de detalles de tareas reportadas...");
    
    // Consulta simplificada y más robusta para obtener las tareas reportadas
    const result = await db.query(
      `SELECT hc.id, hc.id_tarea, hc.accion, hc.fecha_cambio, hc.detalles,
              t.descripcion AS tarea_descripcion, t.estado AS tarea_estado,
              e.id AS evento_id, e.titulo AS evento_titulo, e.fecha_inicio AS evento_fecha,
              esp.nombre AS espacio_nombre,
              u.nombre AS usuario_nombre
       FROM historial_cambios hc
       JOIN tareas t ON hc.id_tarea = t.id
       JOIN eventos e ON t.id_evento = e.id
       JOIN espacios esp ON e.id_espacio = esp.id
       JOIN usuarios u ON hc.id_usuario = u.id
       WHERE hc.accion LIKE '%reportado%'
       ORDER BY hc.fecha_cambio DESC`
    );

    console.log(`Se encontraron ${result.rows.length} registros de historial_cambios con 'reportado'`);

    // Filtramos los resultados para solo incluir los que necesitamos
    const reportesFiltrados = result.rows.filter(row => {
      // Incluir si la acción es "Cambiado de 'pendiente' a 'reportado'"
      // o si la acción es "Cambiado de 'reportado' a 'revisado'"
      // y el estado de la tarea no es 'terminado'
      return (
        (row.accion.includes('Cambiado de "pendiente" a "reportado"') ||
         row.accion.includes('Cambiado de "reportado" a "revisado"')) &&
        row.tarea_estado !== 'terminado'
      );
    });

    console.log(`Después del filtrado, quedan ${reportesFiltrados.length} reportes`);

    // Transformamos los datos para que coincidan con lo que espera el frontend
    const reportesFormateados = reportesFiltrados.map(row => ({
      tarea_id: row.id_tarea,
      descripcion: row.tarea_descripcion,
      estado: row.tarea_estado,
      evento_id: row.evento_id,
      evento_titulo: row.evento_titulo,
      fecha_inicio: row.evento_fecha,
      nombre_espacio: row.espacio_nombre,
      historial_id: row.id,
      reporte_detalles: row.detalles,
      reporte_fecha: row.fecha_cambio,
      accion: row.accion,
      reportado_por: row.usuario_nombre
    }));

    res.json(reportesFormateados);
  } catch (error) {
    console.error("Error al obtener detalles de tareas reportadas:", error);
    res.status(500).json({ message: "Error al obtener los detalles de las tareas reportadas", error: error.message });
  }
};

// NUEVA FUNCIÓN: Obtener detalles de un reporte específico
const getReporteById = async (req, res) => {
  const { id } = req.params;

  try {
    // Consulta para obtener los detalles de un reporte específico
    const result = await db.query(
      `SELECT hc.id, hc.id_tarea, hc.id_usuario, hc.accion, hc.fecha_cambio, hc.detalles, 
              u.nombre AS nombre_usuario, t.descripcion AS descripcion_tarea, t.estado, e.titulo AS evento_titulo
       FROM historial_cambios hc
       JOIN usuarios u ON hc.id_usuario = u.id
       JOIN tareas t ON hc.id_tarea = t.id
       JOIN eventos e ON t.id_evento = e.id
       WHERE hc.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener detalles del reporte:", error);
    res.status(500).json({ message: "Error al obtener los detalles del reporte" });
  }
};

// Función para marcar un reporte como revisado
const marcarReporteComoRevisado = async (req, res) => {
  const { id } = req.params; // Obtenemos el ID del reporte desde la URL

  try {
    // Actualizamos la columna 'accion' en la tabla historial_cambios
    const result = await db.query(
      `UPDATE historial_cambios 
       SET accion = 'Cambiado de "reportado" a "revisado"' 
       WHERE id = $1
       RETURNING *`, // Devolvemos la fila actualizada para confirmar
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Reporte no encontrado o ya fue revisado." });
    }

    console.log(`Reporte ${id} marcado como revisado.`);
    res.json({ message: "Reporte marcado como revisado exitosamente." });

  } catch (error) {
    console.error("Error al marcar reporte como revisado:", error);
    res.status(500).json({ message: "Error al actualizar el reporte", error: error.message });
  }
};

// NUEVA FUNCIÓN: Función para registrar una solución a un reporte
const solucionarReporte = async (req, res) => {
  const { id } = req.params; // Obtenemos el ID del reporte desde la URL
  const { id_usuario, solucion } = req.body; // Obtenemos los datos del cuerpo de la petición

  try {
    // Primero, verificamos que el reporte existe y obtenemos su estado actual
    const reporteResult = await db.query(
      "SELECT accion, id_tarea FROM historial_cambios WHERE id = $1",
      [id]
    );

    if (reporteResult.rows.length === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    const estadoActual = reporteResult.rows[0].accion;
    const id_tarea = reporteResult.rows[0].id_tarea;
    
    // Verificamos que el reporte esté en estado "revisado"
    if (!estadoActual.includes('revisado')) {
      return res.status(400).json({ message: "El reporte debe estar en estado 'revisado' antes de poder solucionarlo." });
    }

    // Actualizamos el estado de la tarea a "terminado"
    await db.query(
      "UPDATE tareas SET estado = 'terminado', id_usuario_completa = $1 WHERE id = $2",
      [id_usuario, id_tarea]
    );

    // Creamos un nuevo registro en historial_cambios para la solución
    await db.query(
      `INSERT INTO historial_cambios (id_tarea, id_usuario, tipo_cambio, accion, detalles, fecha_cambio)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        id_tarea,
        id_usuario,
        'solucion',
        'Cambiado de "revisado" a "solucionado"',
        solucion
      ]
    );

    console.log(`Reporte ${id} solucionado correctamente.`);
    res.json({ message: "Solución registrada exitosamente." });

  } catch (error) {
    console.error("Error al solucionar el reporte:", error);
    res.status(500).json({ message: "Error al solucionar el reporte", error: error.message });
  }
};

// NUEVA FUNCIÓN CORREGIDA: Obtener tareas solucionadas
const getTareasSolucionadas = async (req, res) => {
  try {
    // Consulta para obtener las tareas solucionadas
    const result = await db.query(
      `SELECT t.id, t.descripcion, t.estado, t.id_evento, t.id_departamento_asignado, 
              t.id_usuario_completa, d.nombre AS nombre_departamento, e.titulo AS evento_titulo,
              e.fecha_inicio, esp.nombre AS nombre_espacio,
              hc.detalles AS solucion_descripcion, hc.fecha_cambio AS solucion_fecha,
              u.nombre AS nombre_usuario_solucion
       FROM tareas t
       JOIN departamento d ON t.id_departamento_asignado = d.id
       JOIN eventos e ON t.id_evento = e.id
       JOIN espacios esp ON e.id_espacio = esp.id
       JOIN historial_cambios hc ON t.id = hc.id_tarea
       JOIN usuarios u ON hc.id_usuario = u.id
       WHERE t.estado = 'terminado' 
         AND hc.accion LIKE '%Cambiado de "revisado" a "solucionado"%'
       ORDER BY hc.fecha_cambio DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener tareas solucionadas:", error);
    res.status(500).json({ message: "Error al obtener las tareas solucionadas" });
  }
};

// Exportamos todas las funciones
module.exports = {
  getEventos,
  getEventoById,
  getTareaById,
  getTareasPorEvento,
  crearEvento,
  actualizarEvento,
  cancelarEvento,
  getHistorialEvento,
  getTareasReportadas,
  getDetallesTareasReportadas,
  getReporteById,
  marcarReporteComoRevisado,
  solucionarReporte,
  getTareasSolucionadas, // Añadimos la nueva función corregida
};