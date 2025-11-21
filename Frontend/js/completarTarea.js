// Frontend/js/completarTarea.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM que vamos a usar ---
  const backBtn = document.getElementById("back-btn");
  const tareaInfoContainer = document.getElementById("tarea-info-container");
  const eventoInfoContainer = document.getElementById("evento-info-container");
  const completarTareaForm = document.getElementById("completar-tarea-form");

  // --- Verificación de que el usuario ha iniciado sesión ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html"; // Si no, lo mandamos a login
    return;
  }

  // --- Obtenemos el ID de la tarea que queremos completar ---
  const selectedTareaId = localStorage.getItem("selectedTareaId");
  if (!selectedTareaId) {
    window.location.href = "vistaDiaria.html"; // Si no hay ID, volvemos
    return;
  }

  // --- Lógica de los botones ---
  backBtn.addEventListener("click", () => {
    window.location.href = "vistaDiaria.html"; // Botón para volver atrás
  });

  // --- FUNCIÓN CORREGIDA PARA CARGAR Y MOSTRAR LOS DATOS ---
  const fetchTareaData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. Obtenemos la información de la tarea usando el endpoint correcto
      const response = await fetch(
        `http://127.0.0.1:3001/api/tareas/${selectedTareaId}`,
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

        // 2. Obtenemos la información del evento asociado usando el id_evento de la tarea
        const eventoResponse = await fetch(
          `http://127.0.0.1:3001/api/eventos/${tarea.id_evento}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (eventoResponse.ok) {
          const evento = await eventoResponse.json();
          
          // Mostramos la información del evento en el sidebar
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

  // --- Lógica para cuando se envía el formulario de confirmación ---
  completarTareaForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Llamamos a la dirección del backend para completar la tarea
      const response = await fetch(
        `http://127.0.0.1:3001/api/tareas/${selectedTareaId}/completar`,
        {
          method: "PUT", // Usamos el método PUT porque estamos actualizando un recurso
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: user.id, // Enviamos quién está completando la tarea
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Tarea completada exitosamente");
        window.location.href = "vistaDiaria.html"; // Volvemos a la vista diaria
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al completar la tarea:", error);
      alert("Error de conexión. ¿Está el servidor corriendo?");
    }
  });

  // --- Inicialización: Cargamos los datos al abrir la página ---
  fetchTareaData();
});