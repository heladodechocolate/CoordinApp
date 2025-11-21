document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const editarEventoForm = document.getElementById("editar-evento-form");
  const cancelarBtn = document.getElementById("cancelar-btn");
  const cancelarFooterBtn = document.getElementById("cancelar-footer-btn");
  const lugarSelect = document.getElementById("lugar");
  const equipoSelect = document.getElementById("equipo-select");
  const agregarTareaBtn = document.getElementById("agregar-tarea-btn");
  const tareaInput = document.getElementById("tarea-input");
  const taskListDiv = document.getElementById("task-list");
  const guardarEventoFooterBtn = document.getElementById(
    "guardar-evento-footer-btn"
  );

  // --- Estado de la Aplicación ---
  let tareasAgregadas = [];
  let eventoId = null; // Guardaremos el ID del evento a editar

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Obtener el ID del evento a editar
  eventoId = localStorage.getItem("selectedEventoId");
  if (!eventoId) {
    window.location.href = "vistaDiaria.html";
    return;
  }

  // --- Carga Inicial de Datos ---
  const cargarDatosIniciales = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Cargar espacios y departamentos en paralelo
      const [espaciosResponse, departamentosResponse] = await Promise.all([
        fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/espacios", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/departamentos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (espaciosResponse.ok) {
        const espacios = await espaciosResponse.json();
        espacios.forEach((espacio) => {
          const option = document.createElement("option");
          option.value = espacio.id;
          option.textContent = espacio.nombre;
          lugarSelect.appendChild(option);
        });
      }

      if (departamentosResponse.ok) {
        const departamentos = await departamentosResponse.json();
        departamentos.forEach((depto) => {
          const option = document.createElement("option");
          option.value = depto.id;
          option.textContent = depto.nombre;
          equipoSelect.appendChild(option);
        });
      }

      // Cargar los datos del evento específico
      await cargarDatosEvento();
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      alert("No se pudieron cargar los datos necesarios. Recarga la página.");
    }
  };

  // --- Función para cargar los datos del evento ---
  const cargarDatosEvento = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos/${eventoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("No se pudo cargar el evento");

      const evento = await response.json();

      // Llenar el formulario con los datos del evento
      document.getElementById("titulo").value = evento.titulo;
      document.getElementById("descripcion").value = evento.descripcion;
      document.getElementById("lugar").value = evento.id_espacio;
      document.getElementById("anotaciones").value = evento.anotaciones || "";

      // Formatear fecha y hora
      const fechaInicio = new Date(evento.fecha_inicio);
      const fecha = fechaInicio.toISOString().split("T")[0];
      const hora = fechaInicio.toTimeString().slice(0, 5);
      document.getElementById("fecha").value = fecha;
      document.getElementById("hora").value = hora;

      // Cargar las tareas existentes
      if (evento.tareas && evento.tareas.length > 0) {
        // MODIFICADO: Filtramos para cargar y mostrar solo las tareas pendientes
        const tareasPendientes = evento.tareas.filter(
          (tarea) => tarea.estado === "pendiente"
        );

        tareasAgregadas = tareasPendientes.map((tarea) => ({
          id: tarea.id, // Usamos el ID real de la tarea
          id_departamento_asignado: tarea.id_departamento_asignado,
          nombre_equipo: tarea.nombre_departamento,
          descripcion: tarea.descripcion,
        }));
        renderizarTareas();
      } else {
        renderizarTareas(); // Muestra la lista vacía
      }
    } catch (error) {
      console.error("Error al cargar el evento:", error);
      alert("Error al cargar los datos del evento.");
    }
  };

  // --- Lógica de Tareas (igual que en crearEvento.js) ---
  const renderizarTareas = () => {
    taskListDiv.innerHTML = "";

    if (tareasAgregadas.length === 0) {
      taskListDiv.innerHTML =
        '<p class="empty-list-message">No hay tareas para este evento.</p>';
      return;
    }

    tareasAgregadas.forEach((tarea) => {
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";
      taskItem.innerHTML = `
                <p>${tarea.descripcion}</p>
                <small>Equipo: ${tarea.nombre_equipo}</small>
                <button class="delete-task-btn" data-id="${tarea.id}">X</button>
            `;
      taskListDiv.appendChild(taskItem);
    });

    document.querySelectorAll(".delete-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = parseInt(e.target.getAttribute("data-id"));
        tareasAgregadas = tareasAgregadas.filter((t) => t.id !== taskId);
        renderizarTareas();
      });
    });
  };

  const agregarTarea = () => {
    const equipoId = equipoSelect.value;
    const equipoNombre = equipoSelect.options[equipoSelect.selectedIndex].text;
    const descripcion = tareaInput.value.trim();

    if (!equipoId || !descripcion) {
      alert(
        "Por favor, seleccione un equipo y escriba una descripción para la tarea."
      );
      return;
    }

    const nuevaTarea = {
      id: Date.now(), // ID temporal para nuevas tareas
      id_departamento_asignado: parseInt(equipoId),
      nombre_equipo: equipoNombre,
      descripcion: descripcion,
    };

    tareasAgregadas.push(nuevaTarea);
    renderizarTareas();

    equipoSelect.value = "";
    tareaInput.value = "";
    equipoSelect.focus();
  };

  agregarTareaBtn.addEventListener("click", agregarTarea);
  tareaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarTarea();
    }
  });

  // --- Lógica de Envío del Formulario ---
  guardarEventoFooterBtn.addEventListener("click", async (e) => {
    // El resto del código es exactamente el mismo, solo cambia el evento que escuchamos
    console.log(
      "Botón 'Guardar Cambios' clickeado. Tareas a enviar:",
      tareasAgregadas
    );

    // Validar que se haya agregado al menos una tarea (puedes ajustar esta validación si quieres)
    if (tareasAgregadas.length === 0) {
      alert("Debe agregar al menos una tarea para crear el evento.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    // Combinar fecha y hora
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const fecha_inicio = `${fecha}T${hora}:00`; // Formato ISO 8601

    const payload = {
      titulo: document.getElementById("titulo").value,
      descripcion: document.getElementById("descripcion").value,
      id_espacio: parseInt(lugarSelect.value),
      fecha_inicio: fecha_inicio,
      anotaciones: document.getElementById("anotaciones").value,
      tareas: tareasAgregadas,
    };

    try {
      const response = await fetch(
        `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos/${eventoId}`,
        {
          method: "PUT", // Usamos PUT para actualizar
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("¡Evento actualizado exitosamente!");
        window.location.href = "vistaDiaria.html";
      } else {
        alert(`Error al actualizar el evento: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      alert("Error de conexión. ¿Está el servidor corriendo?");
    }
  });

  // --- Lógica de Botones de Cancelar ---
  const cancelarEdicion = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados."
      )
    ) {
      window.location.href = "vistaDiaria.html";
    }
  };
  cancelarBtn.addEventListener("click", cancelarEdicion);
  cancelarFooterBtn.addEventListener("click", cancelarEdicion);

  // --- Inicialización ---
  cargarDatosIniciales();
});