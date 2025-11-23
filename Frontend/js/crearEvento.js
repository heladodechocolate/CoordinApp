document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const crearEventoFooterBtn = document.getElementById(
    "crear-evento-footer-btn"
  );
  const cancelarBtn = document.getElementById("cancelar-btn");
  const cancelarFooterBtn = document.getElementById("cancelar-footer-btn");
  const lugarSelect = document.getElementById("lugar");
  const equipoSelect = document.getElementById("equipo-select");
  const agregarTareaBtn = document.getElementById("agregar-tarea-btn");
  const tareaInput = document.getElementById("tarea-input");
  const taskListDiv = document.getElementById("task-list");

  // --- Estado de la Aplicación ---
  let tareasAgregadas = []; // Array temporal para guardar las tareas antes de enviarlas

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // --- Carga Inicial de Datos ---
  const cargarDatosIniciales = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Cargar espacios y departamentos en paralelo'
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
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      alert("No se pudieron cargar los datos necesarios. Recarga la página.");
    }
  };

  // --- Lógica de Tareas ---
  const renderizarTareas = () => {
    taskListDiv.innerHTML = ""; // Limpiar la lista

    if (tareasAgregadas.length === 0) {
      taskListDiv.innerHTML =
        '<p class="empty-list-message">No se han agregado tareas aún.</p>';
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

    // Añadir listener a los botones de eliminar
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

    // Validación mejorada para agregar una tarea
    if (!equipoId) {
      alert("Por favor, seleccione un equipo para la tarea.");
      return;
    }

    if (!descripcion) {
      alert("Por favor, ingrese una descripción para la tarea.");
      return;
    }

    const nuevaTarea = {
      id: Date.now(), // ID único y temporal
      id_departamento_asignado: parseInt(equipoId),
      nombre_equipo: equipoNombre,
      descripcion: descripcion,
    };

    tareasAgregadas.push(nuevaTarea);
    renderizarTareas();

    // Limpiar campos de tarea
    equipoSelect.value = "";
    tareaInput.value = "";
    equipoSelect.focus(); // Poner el foco de nuevo en el equipo para la siguiente tarea
  };

  // Listener para el clic del botón
  agregarTareaBtn.addEventListener("click", agregarTarea);

  // Listener para la tecla Enter en el campo de tarea
  tareaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evitar que se envíe el formulario principal
      agregarTarea(); // Llamar a nuestra función para agregar la tarea
    }
  });

  // --- Lógica de Envío del Formulario ---
  crearEventoFooterBtn.addEventListener("click", async (e) => {
    console.log(
      "Botón 'Crear Evento' clickeado. Tareas a enviar:",
      tareasAgregadas
    );

    // Validar que se haya agregado al menos una tarea
    if (tareasAgregadas.length === 0) {
      alert("Debe agregar al menos una tarea para crear el evento.");
      return;
    }

    // --- INICIO DE LA VALIDACIÓN DEL TÍTULO ---
    const titulo = document.getElementById("titulo").value.trim();
    if (!titulo) {
      alert("El título del evento es obligatorio. Por favor, complétalo.");
      return;
    }
    // --- FIN DE LA VALIDACIÓN DEL TÍTULO ---

    const token = localStorage.getItem("token");
    if (!token) return;

    // Combinar fecha y hora
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const fecha_inicio = `${fecha}T${hora}:00`; // Formato ISO 8601

    const payload = {
      titulo: titulo, // Usamos la variable ya validada
      descripcion: document.getElementById("descripcion").value,
      id_espacio: parseInt(lugarSelect.value),
      fecha_inicio: fecha_inicio,
      anotaciones: document.getElementById("anotaciones").value,
      tareas: tareasAgregadas, // <-- ¡Este es el array que queremos!
    };

    try {
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Verificamos si la respuesta es JSON antes de parsearla
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("El servidor no devolvió JSON:", text);
        throw new Error("El servidor devolvió una respuesta inesperada");
      }

      const data = await response.json();

      if (response.ok) {
        alert("¡Evento creado exitosamente!");
        window.location.href = "index.html";
      } else {
        alert(`Error al crear el evento: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al crear evento:", error);
      alert(
        "Error de conexión o del servidor. Revisa la consola para más detalles."
      );
    }
  });

  // --- Lógica de Botones de Cancelar ---
  const cancelarCreacion = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados."
      )
    ) {
      window.location.href = "index.html";
    }
  };
  cancelarBtn.addEventListener("click", cancelarCreacion);
  cancelarFooterBtn.addEventListener("click", cancelarCreacion);

  // --- Inicialización ---
  cargarDatosIniciales();
});