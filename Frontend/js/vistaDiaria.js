  // Frontend/js/vistaDiaria.js

  document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos del DOM ---
    const backBtn = document.getElementById("back-btn");
    const selectedDateDisplay = document.getElementById("selected-date-display");
    const eventListContainer = document.getElementById("event-list-container");
    const accionesDelDiaContainer = document.getElementById(
      "tareas-pendientes-container"
    );

    // --- Lógica de Autenticación y Carga Inicial ---
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // --- INICIO DE LA PRUEBA AISLADA ---
    console.log("--- DEPURACIÓN: Iniciando la verificación de permisos ---");

    const userFromStorage = JSON.parse(localStorage.getItem("user"));
    console.log("--- DEPURACIÓN: Objeto 'user' completo desde localStorage ---");
    console.log(userFromStorage); // <-- ¡MIRA ESTO EN LA CONSOLA!
    console.log("--- FIN DE LA DEPURACIÓN ---");

    const isAdmin = esAdminDeAdministracion();
    console.log(
      `--- DEPURACIÓN: Resultado de esAdminDeAdministracion(): ${isAdmin} ---`
    ); // <-- ¡MIRA ESTO TAMBIÉN!

    const cuadroDePrueba = document.getElementById("cuadro-de-prueba");

    if (isAdmin) {
      console.log(
        "--- DEPURACIÓN: La condición fue TRUE. El cuadro PERMANECE visible. ---"
      );
    } else {
      console.log(
        "--- DEPURACIÓN: La condición fue FALSE. Intentando OCULTAR el cuadro. ---"
      );
      if (cuadroDePrueba) {
        cuadroDePrueba.style.display = "none";
        console.log("--- DEPURACIÓN: Cuadro oculto con éxito. ---");
      } else {
        console.log(
          "--- DEPURACIÓN: ERROR: No se encontró el elemento 'cuadro-de-prueba' en el HTML. ---"
        );
      }
    }
    // --- FIN DE LA PRUEBA AISLADA ---

    // Obtener la fecha seleccionada desde el localStorage
    const selectedDate = localStorage.getItem("selectedDate");
    if (!selectedDate) {
      window.location.href = "index.html";
      return;
    }

    // Formatear y mostrar la fecha seleccionada en el header
    const dateObj = new Date(selectedDate + "T00:00:00");
    selectedDateDisplay.textContent = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // --- Lógica de Botones ---
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });

    // --- Lógica de Carga y Filtrado de Eventos ---
    const fetchAndDisplayEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:3001/api/eventos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("No se pudieron cargar los eventos");

        const allEventos = await response.json();

        const dailyEvents = allEventos.filter((evento) => {
          const eventDate = new Date(evento.fecha_inicio)
            .toISOString()
            .split("T")[0];
          return eventDate === selectedDate;
        });

        const eventosConTareas = await Promise.all(
          dailyEvents.map(async (evento) => {
            try {
              const tareasResponse = await fetch(
                `http://127.0.0.1:3001/api/eventos/${evento.id}/tareas`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (tareasResponse.ok) {
                const tareas = await tareasResponse.json();
                const tareasPendientes = tareas.filter(
                  (tarea) =>
                    tarea.estado !== "terminado" && tarea.estado !== "reportado"
                );
                const tareasTerminadas = tareas.filter(
                  (tarea) => tarea.estado === "terminado"
                );

                const tareasPendientesPorDepartamento = {};
                tareasPendientes.forEach((tarea) => {
                  if (
                    !tareasPendientesPorDepartamento[tarea.nombre_departamento]
                  ) {
                    tareasPendientesPorDepartamento[tarea.nombre_departamento] =
                      [];
                  }
                  tareasPendientesPorDepartamento[tarea.nombre_departamento].push(
                    tarea
                  );
                });

                return {
                  ...evento,
                  tareasPorDepartamento: tareasPendientesPorDepartamento,
                  tareasTerminadas,
                };
              }
              return {
                ...evento,
                tareasPorDepartamento: {},
                tareasTerminadas: [],
              };
            } catch (error) {
              console.error(
                `Error al cargar tareas para el evento ${evento.id}:`,
                error
              );
              return {
                ...evento,
                tareasPorDepartamento: {},
                tareasTerminadas: [],
              };
            }
          })
        );

        displayEventosConTareas(eventosConTareas);

        const todasLasTareasTerminadas = eventosConTareas.flatMap(
          (evento) => evento.tareasTerminadas
        );

        displayAccionesDelDia(todasLasTareasTerminadas);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        eventListContainer.innerHTML =
          "<p>No se pudieron cargar los eventos para este día.</p>";
      }
    };

    const displayAccionesDelDia = (tareas) => {
      accionesDelDiaContainer.innerHTML = "";

      if (tareas.length === 0) {
        accionesDelDiaContainer.innerHTML =
          "<p>No hay tareas completadas hoy.</p>";
        return;
      }

      const tareasPorDepartamento = {};
      tareas.forEach((tarea) => {
        if (!tareasPorDepartamento[tarea.nombre_departamento]) {
          tareasPorDepartamento[tarea.nombre_departamento] = [];
        }
        tareasPorDepartamento[tarea.nombre_departamento].push(tarea);
      });

      const titulo = document.createElement("h4");
      titulo.textContent = "Tareas Completadas Hoy";
      accionesDelDiaContainer.appendChild(titulo);

      for (const [departamento, tareas] of Object.entries(
        tareasPorDepartamento
      )) {
        const departamentoDiv = document.createElement("div");
        departamentoDiv.className = "departamento-container";
        departamentoDiv.innerHTML = `<h6>${departamento}:</h6>`;

        const tareasList = document.createElement("ul");
        tareasList.className = "tareas-list";

        tareas.forEach((tarea) => {
          const tareaItem = document.createElement("li");
          tareaItem.className = "tarea-item completed-task-item";
          tareaItem.innerHTML = `
            <p>${tarea.descripcion}</p>
            <div class="tarea-footer">
              <small>Completada</small>
            </div>
          `;
          tareasList.appendChild(tareaItem);
        });

        departamentoDiv.appendChild(tareasList);
        accionesDelDiaContainer.appendChild(departamentoDiv);
      }
    };

    const displayEventosConTareas = (eventos) => {
      eventListContainer.innerHTML = "";

      if (eventos.length === 0) {
        eventListContainer.innerHTML =
          "<p>No hay eventos programados para este día.</p>";
        return;
      }

      eventos.forEach((evento) => {
        const eventCard = document.createElement("div");
        eventCard.className = "event-card";

        const eventTime = new Date(evento.fecha_inicio).toLocaleTimeString(
          "es-ES",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        let eventoHTML = `
          <h4>${evento.titulo}</h4>
          <p><strong>Hora:</strong> ${eventTime}</p>
          <p><strong>Lugar:</strong> ${evento.nombre_espacio}</p>
          <p><strong>Estado:</strong> ${evento.estado}</p>
        `;

        if (
          evento.tareasPorDepartamento &&
          Object.keys(evento.tareasPorDepartamento).length > 0
        ) {
          eventoHTML +=
            '<div class="tareas-container"><h5>Tareas Pendientes:</h5>';
          for (const [departamento, tareas] of Object.entries(
            evento.tareasPorDepartamento
          )) {
            eventoHTML += `
              <div class="departamento-tareas">
                <h6>${departamento}:</h6>
                <ul class="tareas-list">
            `;
            tareas.forEach((tarea) => {
              eventoHTML += `
                <li class="tarea-item">
                  <span>${tarea.descripcion}</span>
                  <div class="tarea-buttons">
                    <button class="complete-task-btn" data-task-id="${tarea.id}">Completar</button>
                    <button class="report-task-btn" data-task-id="${tarea.id}">Reportar</button>
                  </div>
                </li>
              `;
            });
            eventoHTML += `
                </ul>
              </div>
            `;
          }
          eventoHTML += "</div>";
        } else {
          eventoHTML +=
            "<p><strong>Tareas Pendientes:</strong> No hay tareas pendientes para este evento.</p>";
        }

        // Aquí es donde controlaremos el botón de editar
        let eventoActionsHTML = `<div class="event-actions">`;
        if (esAdminDeAdministracion()) {
          eventoActionsHTML += `<button class="edit-event-btn" data-event-id="${evento.id}">Editar Evento</button>`;
        }
        eventoActionsHTML += `</div>`;

        eventoHTML += eventoActionsHTML;

        eventCard.innerHTML = eventoHTML;
        eventListContainer.appendChild(eventCard);
      });

      document.querySelectorAll(".complete-task-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const taskId = btn.getAttribute("data-task-id");
          localStorage.setItem("selectedTareaId", taskId);
          window.location.href = "completarTarea.html";
        });
      });

      document.querySelectorAll(".report-task-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const taskId = btn.getAttribute("data-task-id");
          localStorage.setItem("selectedTareaId", taskId);
          window.location.href = "reportarTarea.html";
        });
      });

      document.querySelectorAll(".edit-event-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const eventId = btn.getAttribute("data-event-id");
          localStorage.setItem("selectedEventoId", eventId);
          window.location.href = "editarEvento.html";
        });
      });
    };

    // --- Inicialización ---
    fetchAndDisplayEvents();
  });
