// main.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const welcomeMessage = document.getElementById("welcome-message");
  const logoutBtn = document.getElementById("logout-btn");
  const calendarEl = document.getElementById("simple-calendar");
  const currentMonthLabel = document.getElementById("current-month-label");
  const prevMonthBtn = document.getElementById("prev-month-btn");
  const nextMonthBtn = document.getElementById("next-month-btn");

  // --- Estado de la Aplicación ---
  let eventos = [];
  let currentDate = new Date();

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  welcomeMessage.textContent = `Bienvenido, ${user.nombre}`;

  // 🔥 INICIO: LÓGICA PARA OCULTAR BOTONES DE ADMIN 🔥
  // Usamos nuestra función de utils.js para verificar el rol
  if (!esAdminDeAdministracion()) {
    // Si el usuario NO es admin, buscamos el contenedor y lo ocultamos
    const adminActionsContainer = document.getElementById("admin-actions-container");
    if (adminActionsContainer) {
      adminActionsContainer.style.display = "none";
    }
  }
  // 🔥 FIN: LÓGICA PARA OCULTAR BOTONES DE ADMIN 🔥

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  // --- Lógica del Botón Crear Evento ---
  const crearEventoBtn = document.getElementById("crear-evento-btn");
  if (crearEventoBtn) {
    crearEventoBtn.addEventListener("click", () => {
      console.log("Botón 'Crear Evento' presionado.");
      window.location.href = "crearEvento.html";
    });
  }

  // NUEVO: Lógica del Botón Historial
  const historialBtn = document.getElementById("historial-btn");
  if (historialBtn) {
    historialBtn.addEventListener("click", () => {
      console.log("Botón 'Historial' presionado.");
      window.location.href = "historial.html";
    });
  }

  // NUEVO: Lógica del Botón Reportes
  const reportesBtn = document.getElementById("reportes-btn");
  if (reportesBtn) {
    reportesBtn.addEventListener("click", () => {
      console.log("Botón 'Reportes' presionado.");
      window.location.href = "reportes.html";
    });
  }

  // --- Lógica del Calendario ---
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthLabel.textContent = `${new Date(year, month).toLocaleDateString(
      "es-ES",
      { month: "long", year: "numeric" }
    )}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html =
      "<table><thead><tr><th>Dom</th><th>Lun</th><th>Mar</th><th>Mié</th><th>Jue</th><th>Vie</th><th>Sáb</th></tr></thead><tbody><tr>";

    // Días vacíos al principio
    for (let i = 0; i < firstDay; i++) {
      html += '<td class="empty-day"></td>';
    }

    // Días del mes
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      html += `<td class="day ${
        isToday ? "today" : ""
      }" data-date="${dateStr}"><span class="day-number">${day}</span></td>`;

      if ((firstDay + day) % 7 === 0) {
        html += "</tr><tr>";
      }
    }

    html += "</tr></tbody></table>";
    calendarEl.innerHTML = html;

    // Añadir eventos a los días
    eventos.forEach((evento) => {
      // Verificación adicional para no mostrar eventos cancelados
      if (evento.estado === 'cancelado') {
        return; // Saltar este evento
      }
      
      const eventDate = new Date(evento.fecha_inicio)
        .toISOString()
        .split("T")[0];
      const dayCell = calendarEl.querySelector(`td[data-date="${eventDate}"]`);
      if (dayCell) {
        const eventDiv = document.createElement("div");
        eventDiv.className = "event-title";
        eventDiv.textContent = evento.titulo;
        dayCell.appendChild(eventDiv);
      }
    });

    // --- NUEVO CÓDIGO: AÑADIR EVENTO DE CLICK A CADA DÍA ---
    const allDayCells = calendarEl.querySelectorAll("td.day");
    allDayCells.forEach((cell) => {
      cell.addEventListener("click", () => {
        const clickedDate = cell.dataset.date;
        // Guardamos la fecha en el localStorage para que la otra página la lea
        localStorage.setItem("selectedDate", clickedDate);
        // Redirigimos a la página de vista diaria
        window.location.href = "vistaDiaria.html"; //
      });
    });
  };

  // =================================================================
  // INICIO: LÓGICA PARA EL PANEL DE TAREAS DEL DÍA
  // =================================================================
  const cargarMisTareasDelDia = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return; // Si no hay usuario, no hacemos nada

    const token = localStorage.getItem("token");
    
    // CORRECCIÓN: Obtenemos la fecha de hoy en formato YYYY-MM-DD considerando la zona horaria local
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    const userDepartamento = user.departamento;

    // 1. Actualizar el título del departamento
    const departamentoTitulo = document.getElementById('mi-departamento-titulo');
    if (departamentoTitulo) {
        departamentoTitulo.textContent = userDepartamento;
    }

    // 2. Filtrar los eventos que son para hoy
    const eventosDeHoy = eventos.filter(evento => {
        // Verificación adicional para no considerar eventos cancelados
        if (evento.estado === 'cancelado') {
          return false;
        }
        
        // CORRECCIÓN: Convertimos la fecha del evento a la zona horaria local antes de comparar
        const eventDate = new Date(evento.fecha_inicio);
        const eventDateStr = eventDate.getFullYear() + '-' + 
          String(eventDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(eventDate.getDate()).padStart(2, '0');
        
        return eventDateStr === todayStr;
    });

    console.log(`Eventos para hoy (${todayStr}):`, eventosDeHoy);

    if (eventosDeHoy.length === 0) {
        document.getElementById('tareas-del-dia-list').innerHTML = '<p class="empty-list-message">No tienes eventos asignados para hoy.</p>';
        return;
    }

    // 3. Para cada evento de hoy, obtener sus tareas
    const promesasDeTareas = eventosDeHoy.map(async (evento) => {
        const response = await fetch(`https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos/${evento.id}/tareas?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const tareas = await response.json();
        console.log(`Tareas recibidas para el evento ${evento.id}:`, tareas);
        return tareas;
    });

    try {
        const todasLasTareas = await Promise.all(promesasDeTareas);
        const tareasDelDia = todasLasTareas.flat(); // Aplanamos el array de arrays

        // 4. Filtrar las tareas que son del departamento del usuario y están pendientes
        const misTareasPendientes = tareasDelDia.filter(tarea =>
            tarea.nombre_departamento === userDepartamento && tarea.estado === 'pendiente'
        );

        // 5. Filtrar las tareas que son del departamento del usuario y están terminadas
        const misTareasTerminadas = tareasDelDia.filter(tarea =>
            tarea.nombre_departamento === userDepartamento && tarea.estado === 'terminado'
        );

        // 6. Para cada tarea terminada, obtener su historial para encontrar la solución
        const tareasTerminadasConHistorial = await Promise.all(
          misTareasTerminadas.map(async (tarea) => {
            try {
              // Buscamos directamente la solución de esta tarea usando el nuevo endpoint
              const solucionResponse = await fetch(`https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/tareas/${tarea.id}/solucion`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if (solucionResponse.ok) {
                const solucion = await solucionResponse.json();
                console.log("Solución encontrada para la tarea", tarea.id, ":", solucion);
                
                return {
                  ...tarea,
                  solucion_descripcion: solucion.detalles,
                  solucion_fecha: solucion.fecha_cambio,
                  nombre_usuario_solucion: solucion.nombre_usuario
                };
              }
            } catch (error) {
              console.error("Error al obtener solución de la tarea:", error);
            }
            
            return tarea; // Si no hay solución o hay error, devolvemos la tarea sin información de solución
          })
        );

        // 7. Combinar tareas pendientes y terminadas
        const todasMisTareas = [...misTareasPendientes, ...tareasTerminadasConHistorial];

        console.log(`Tareas para ${userDepartamento}:`, todasMisTareas);

        // 8. Mostrar las tareas en el panel
        displayMisTareas(todasMisTareas, eventosDeHoy);

    } catch (error) {
        console.error("Error al cargar las tareas del día:", error);
        document.getElementById('tareas-del-dia-list').innerHTML = '<p class="error-message">No se pudieron cargar tus tareas.</p>';
    }
};

const displayMisTareas = (tareas, eventos) => {
    const tareasListContainer = document.getElementById('tareas-del-dia-list');

    if (tareas.length === 0) {
        tareasListContainer.innerHTML = '<p class="empty-list-message">¡No tienes tareas para hoy!</p>';
        return;
    }

    let html = '';
    tareas.forEach(tarea => {
        // --- LÍNEA DE DEPURACIÓN AÑADIDA ---
        console.log("Investigando la tarea recibida:", tarea);

        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Aseguramos que id_evento sea un número válido antes de buscar
        const tareaEventoId = parseInt(tarea.id_evento);

        // Verificamos si el ID es válido antes de buscar
        if (isNaN(tareaEventoId)) {
            console.error(`ID de evento inválido para la tarea ${tarea.id}:`, tarea.id_evento);
            return; // Saltamos esta tarea si no hay un ID de evento válido
        }

        const eventoPadre = eventos.find(e => e.id === tareaEventoId);

        // Añadimos una comprobación por si acaso el evento no se encuentra
        if (!eventoPadre) {
            console.error(`No se encontró el evento con ID ${tareaEventoId} para la tarea ${tarea.id}`);
            return; // Saltamos esta tarea si no hay evento padre
        }

        const eventTime = new Date(eventoPadre.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        // Determinamos si la tarea está solucionada
        const esSolucionada = tarea.estado === 'terminado';
        const cardClass = esSolucionada ? 'event-card solved-task' : 'event-card task-pendiente';

        // CORRECCIÓN CLAVE: Manejamos el caso donde no hay información de solución
        // Añadimos más información de depuración
        console.log("Tarea solucionada:", esSolucionada);
        console.log("solucion_descripcion:", tarea.solucion_descripcion);
        
        const solucionDescripcion = esSolucionada && tarea.solucion_descripcion ? tarea.solucion_descripcion : 'No se registró una descripción para esta solución.';
        
        html += `
            <div class="${cardClass}">
                <h4>${tarea.descripcion} ${esSolucionada ? '<span class="solved-badge">SOLUCIONADO</span>' : ''}</h4>
                <p><strong>Hora:</strong> ${eventTime}</p>
                <p><strong>Lugar:</strong> ${eventoPadre.nombre_espacio}</p>
                ${esSolucionada ? `
                    <p><strong>Solución:</strong> ${solucionDescripcion}</p>
                ` : ''}
                <div class="tarea-footer">
                    <button class="complete-task-btn" data-task-id="${tarea.id}">Completar</button>
                    <button class="report-task-btn" data-task-id="${tarea.id}">Reportar</button>
                </div>
            </div>
        `;
    });

    tareasListContainer.innerHTML = html;

    // Añadir listeners a los botones
    document.querySelectorAll('.complete-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.getAttribute('data-task-id');
            localStorage.setItem('selectedTareaId', taskId);
            window.location.href = 'completarTarea.html';
        });
    });

    document.querySelectorAll('.report-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.getAttribute('data-task-id');
            localStorage.setItem('selectedTareaId', taskId);
            console.log(`Intentando reportar tarea ${taskId} que está en estado: ${tareas.find(t => t.id == taskId)?.estado}`);
            window.location.href = 'reportarTarea.html';
        });
    });
};
  // =================================================================
  // FIN: LÓGICA PARA EL PANEL DE TAREAS DEL DAREA
  // =================================================================

  // --- Carga de Datos desde la API ---
  const fetchEventos = async () => {
    console.log("Intentando cargar eventos...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No se encontró token de autenticación.");
      return;
    }

    try {
      // LÍNEA CAMBIADA: localhost -> 127.0.0.1
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respuesta del servidor:", response);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      eventos = await response.json();
      console.log("Eventos cargados:", eventos);
      renderCalendar(); // <-- MUY IMPORTANTE: Se llama a renderizar DESPUÉS de tener los eventos
      
      // =================================================================
      // AQUÍ LLAMAMOS A LA NUEVA FUNCIÓN
      // =================================================================
      cargarMisTareasDelDia();
      // =================================================================

    } catch (error) {
      console.error("Error al cargar eventos:", error);
      alert(
        "No se pulieron cargar los eventos. Revisa la consola para más detalles."
      );
    }
  };

  // --- Navegación del Calendario ---
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // --- Inicialización ---
  fetchEventos(); // <-- ¡LA LLAMADA INICIAL QUE FALTABA!
});