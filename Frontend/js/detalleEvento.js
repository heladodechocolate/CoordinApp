document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const backBtn = document.getElementById("back-btn");
  const eventDetailsContainer = document.getElementById("event-details");
  const teamsTasksListContainer = document.getElementById("teams-tasks-list");
  const eventNotesContainer = document.getElementById("event-notes");

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Obtener el ID del evento a mostrar
  const eventoId = localStorage.getItem("selectedEventoId");
  if (!eventoId) {
    window.location.href = "historial.html";
    return;
  }

  // --- Lógica de Botones ---
  backBtn.addEventListener("click", () => {
    window.location.href = "historial.html";
  });

  // --- Función para cargar y mostrar los datos del evento y su historial ---
  const fetchAndDisplayEvento = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:3001/api/eventos/${eventoId}/historial`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error("No se pudo cargar el historial del evento");

      const evento = await response.json();

      // Mostrar la información general del evento
      const eventDate = new Date(evento.fecha_inicio).toLocaleDateString(
        "es-ES"
      );
      eventDetailsContainer.innerHTML = `
                <p><strong>Título:</strong> ${evento.titulo}</p>
                <p><strong>Fecha:</strong> ${eventDate}</p>
                <p><strong>Descripción:</strong> ${evento.descripcion}</p>
                <p><strong>Lugar:</strong> ${evento.nombre_espacio}</p>
            `;

      // Mostrar las anotaciones del evento
      eventNotesContainer.innerHTML = `
                <p>${
                  evento.anotaciones || "No hay anotaciones para este evento."
                }</p>
            `;

      // Agrupar las tareas por departamento
const tareasPorDepartamento = {};
evento.tareas.forEach((tarea) => {
    if (!tareasPorDepartamento[tarea.nombre_departamento]) {
        tareasPorDepartamento[tarea.nombre_departamento] = [];
    }
    tareasPorDepartamento[tarea.nombre_departamento].push(tarea);
});

// Mostrar los equipos y sus tareas
teamsTasksListContainer.innerHTML = "";
for (const [departamento, tareas] of Object.entries(tareasPorDepartamento)) {
    const departamentoDiv = document.createElement("div");
    departamentoDiv.className = "departamento-container";
    departamentoDiv.innerHTML = `<h4>${departamento}:</h4>`;

    tareas.forEach((tarea) => {
        // NUEVO: Creamos un div para cada tarea
        const tareaDiv = document.createElement("div");
        tareaDiv.className = "tarea-details-container";
        
        // NUEVO: Mostramos el ID y la descripción de la tarea
        tareaDiv.innerHTML = `
            <p><strong>ID de la Tarea:</strong> ${tarea.id}</p>
            <p><strong>Descripción:</strong> ${tarea.descripcion}</p>
        `;

        // NUEVO: Creamos un div para el historial de cambios
        const historialCambiosDiv = document.createElement("div");
        historialCambiosDiv.className = "historial-cambios-table-container";

        // NUEVO: Creamos la tabla para el historial de cambios
        let tablaHTML = `
            <h5>Historial de Cambios</h5>
            <table class="historial-table">
                <thead>
                    <tr>
                        <th>ID Cambio</th>
                        <th>Usuario</th>
                        <th>Tipo Cambio</th>
                        <th>Acción</th>
                        <th>Detalles</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // NUEVO: Verificamos si hay historial de cambios y los mostramos
        if (tarea.historial_cambios && tarea.historial_cambios.length > 0) {
            tarea.historial_cambios.forEach((registro) => {
                tablaHTML += `
                    <tr>
                        <td>${registro.id}</td>
                        <td>${registro.nombre_usuario || 'N/A'}</td>
                        <td>${registro.tipo_cambio}</td>
                        <td>${registro.accion}</td>
                        <td>${registro.detalles}</td>
                        <td>${new Date(registro.fecha_cambio).toLocaleString("es-ES")}</td>
                    </tr>
                `;
            });
        } else {
            // NUEVO: Si no hay historial, mostramos un mensaje
            tablaHTML += `
                <tr>
                    <td colspan="6">No hay historial de cambios para esta tarea.</td>
                </tr>
            `;
        }

        tablaHTML += `
                </tbody>
            </table>
        `;

        historialCambiosDiv.innerHTML = tablaHTML;
        tareaDiv.appendChild(historialCambiosDiv);
        departamentoDiv.appendChild(tareaDiv);
    });

    teamsTasksListContainer.appendChild(departamentoDiv);
}

      // Mostrar los equipos y sus tareas
      teamsTasksListContainer.innerHTML = "";
      for (const [departamento, tareas] of Object.entries(
        tareasPorDepartamento
      )) {
        const departamentoDiv = document.createElement("div");
        departamentoDiv.className = "departamento-container";
        departamentoDiv.innerHTML = `<h4>${departamento}:</h4>`;

        const tareasList = document.createElement("ul");
        tareasList.className = "tareas-list";

        tareas.forEach((tarea) => {
          const tareaItem = document.createElement("li");
          tareaItem.className = "tarea-item";
          tareaItem.innerHTML = `
                        <p><strong>Tarea:</strong> ${tarea.descripcion}</p>
                        <p><strong>Estado:</strong> ${tarea.estado}</p>
                    `;

          // Mostrar el historial de tareas
          if (tarea.historial_tareas && tarea.historial_tareas.length > 0) {
            const historialTareasDiv = document.createElement("div");
            historialTareasDiv.className = "historial-tareas";
            historialTareasDiv.innerHTML = "<h5>Historial de Tareas:</h5>";

            const historialTareasList = document.createElement("ul");
            tarea.historial_tareas.forEach((registro) => {
              const historialItem = document.createElement("li");
              historialItem.innerHTML = `
                                <p><strong>Usuario:</strong> ${
                                  registro.nombre_usuario
                                }</p>
                                <p><strong>Acción:</strong> ${
                                  registro.accion
                                }</p>
                                <p><strong>Fecha:</strong> ${new Date(
                                  registro.fecha_cambio
                                ).toLocaleString("es-ES")}</p>
                            `;
              historialTareasList.appendChild(historialItem);
            });

            historialTareasDiv.appendChild(historialTareasList);
            tareaItem.appendChild(historialTareasDiv);
          }

          // Mostrar el historial de cambios
          if (tarea.historial_cambios && tarea.historial_cambios.length > 0) {
            const historialCambiosDiv = document.createElement("div");
            historialCambiosDiv.className = "historial-cambios";
            historialCambiosDiv.innerHTML = "<h5>Historial de Cambios:</h5>";

            const historialCambiosList = document.createElement("ul");
            tarea.historial_cambios.forEach((registro) => {
              const historialItem = document.createElement("li");
              historialItem.innerHTML = `
                                <p><strong>Usuario:</strong> ${
                                  registro.nombre_usuario
                                }</p>
                                <p><strong>Tipo de Cambio:</strong> ${
                                  registro.tipo_cambio
                                }</p>
                                <p><strong>Acción:</strong> ${
                                  registro.accion
                                }</p>
                                <p><strong>Detalles:</strong> ${
                                  registro.detalles
                                }</p>
                                <p><strong>Fecha:</strong> ${new Date(
                                  registro.fecha_cambio
                                ).toLocaleString("es-ES")}</p>
                            `;
              historialCambiosList.appendChild(historialItem);
            });

            historialCambiosDiv.appendChild(historialCambiosList);
            tareaItem.appendChild(historialCambiosDiv);
          }

          tareasList.appendChild(tareaItem);
        });

        departamentoDiv.appendChild(tareasList);
        teamsTasksListContainer.appendChild(departamentoDiv);
      }
    } catch (error) {
      console.error("Error al cargar el historial del evento:", error);
      alert("Error al cargar los datos del evento.");
    }
  };

  // --- Inicialización ---
  fetchAndDisplayEvento();
});
