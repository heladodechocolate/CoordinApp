// En main.js

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
      const response = await fetch("http://127.0.0.1:3001/api/eventos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respuesta del servidor:", response);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      eventos = await response.json();
      console.log("Eventos cargados:", eventos);
      renderCalendar(); // <-- MUY IMPORTANTE: Se llama a renderizar DESPUÉS de tener los eventos
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      alert(
        "No se pudieron cargar los eventos. Revisa la consola para más detalles."
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