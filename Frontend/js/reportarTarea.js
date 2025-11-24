document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM que vamos a usar ---
  const backBtn = document.getElementById("back-btn");
  const tareaInfoContainer = document.getElementById("tarea-info-container");
  const eventoInfoContainer = document.getElementById("evento-info-container");
  const reportarTareaForm = document.getElementById("reportar-tarea-form");

  // --- Verificación de que el usuario ha iniciado sesión ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html"; // Si no, lo mandamos a login
    return;
  }

  // --- Obtenemos el ID de la tarea que queremos reportar ---
  const selectedTareaId = localStorage.getItem("selectedTareaId");
  if (!selectedTareaId) {
    window.location.href = "vistaDiaria.html"; // Si no hay ID, volvemos
    return;
  }

  // --- Lógica de los botones ---
  backBtn.addEventListener("click", () => {
    window.location.href = "vistaDiaria.html"; // Botón para volver atrás
  });

  // --- Función para cargar y mostrar los datos de la tarea y su evento ---
  const fetchTareaData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Obtenemos la información de la tarea usando el endpoint correcto
      const response = await fetch(
        `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/tareas/${selectedTareaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const tarea = await response.json();
        
        // Mostramos la información de la tarea
        tareaInfoContainer.innerHTML = `
          <div class="event-card">
            <h4>Tarea: ${tarea.descripcion}</h4>
            <p><strong>Departamento:</strong> ${tarea.nombre_departamento}</p>
            <p><strong>Estado actual:</strong> ${tarea.estado}</p>
          </div>
        `;

        // Obtenemos la información del evento asociado
        const eventoResponse = await fetch(
          `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos/${tarea.id_evento}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (eventoResponse.ok) {
          const evento = await eventoResponse.json();
          
          // Mostramos la información del evento
          eventoInfoContainer.innerHTML = `
            <div class="event-card">
              <h4>${evento.titulo}</h4>
              <p><strong>Fecha:</strong> ${new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}</p>
              <p><strong>Lugar:</strong> ${evento.nombre_espacio}</p>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      tareaInfoContainer.innerHTML =
        "<p>No se pudo cargar la información de la tarea.</p>";
    }
  };

  // --- Lógica para cuando se envía el formulario de reporte ---
  reportarTareaForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const token = localStorage.getItem("token");
    if (!token) return;

    // Obtenemos los datos del formulario
    const motivo = document.getElementById("motivo").value;
    const descripcion = document.getElementById("descripcion").value;

    try {
      // Llamamos al endpoint del backend para reportar la tarea
      const response = await fetch(
        `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/tareas/${selectedTareaId}/reportar`,
        {
          method: "PUT", // Usamos el método PUT porque estamos actualizando un recurso
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: user.id, // Enviamos quién está reportando la tarea
            motivo: motivo,
            descripcion: descripcion
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Tarea reportada exitosamente");
        window.location.href = "index.html"; // Volvemos a la vista diaria
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al reportar la tarea:", error);
      alert("Error de conexión. ¿Está el servidor corriendo?");
    }
  });

  // --- Inicialización: Cargamos los datos al abrir la página ---
  fetchTareaData();
});