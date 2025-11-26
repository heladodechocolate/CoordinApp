// Frontend/js/solucionReporte.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM que vamos a usar ---
  const backBtn = document.getElementById("back-btn");
  const reporteInfoContainer = document.getElementById("reporte-info-container");
  const reporteInfoSidebar = document.getElementById("reporte-info-sidebar");
  const solucionReporteForm = document.getElementById("solucion-reporte-form");

  // --- Verificación de que el usuario ha iniciado sesión ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html"; // Si no, lo mandamos a login
    return;
  }

  // --- Obtenemos el ID del reporte que queremos solucionar ---
  const selectedReporteId = localStorage.getItem("selectedReporteId");
  if (!selectedReporteId) {
    window.location.href = "reportes.html"; // Si no hay ID, volvemos
    return;
  }

  // --- Lógica de los botones ---
  backBtn.addEventListener("click", () => {
    window.location.href = "reportes.html"; // Botón para volver atrás
  });

  // --- Función para cargar y mostrar los datos del reporte ---
  const fetchReporteData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Obtenemos la información del reporte usando el endpoint correcto
      const response = await fetch(
        `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${selectedReporteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const reporte = await response.json();
        
        // Mostramos la información del reporte
        reporteInfoContainer.innerHTML = `
          <div class="event-card">
            <h4>Reporte ID: ${reporte.id}</h4>
            <p><strong>Tarea:</strong> ${reporte.descripcion_tarea}</p>
            <p><strong>Estado actual:</strong> ${reporte.estado}</p>
            <p><strong>Reportado por:</strong> ${reporte.nombre_usuario}</p>
            <p><strong>Fecha del reporte:</strong> ${new Date(reporte.fecha_cambio).toLocaleDateString('es-ES')}</p>
          </div>
        `;

        // Mostramos la información del reporte en la barra lateral
        reporteInfoSidebar.innerHTML = `
          <div class="event-card">
            <h4>Evento: ${reporte.evento_titulo}</h4>
            <p><strong>Detalles del reporte:</strong> ${reporte.detalles}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      reporteInfoContainer.innerHTML =
        "<p>No se pudo cargar la información del reporte.</p>";
    }
  };

  // --- Lógica para cuando se envía el formulario de solución ---
  solucionReporteForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const token = localStorage.getItem("token");
    if (!token) return;

    // Obtenemos los datos del formulario
    const solucion = document.getElementById("solucion").value;

    // Validamos que haya contenido en el campo de solución
    if (!solucion || solucion.trim() === "") {
      alert("Por favor, ingrese una descripción detallada de la solución.");
      return;
    }

    try {
      // Llamamos al endpoint del backend para solucionar el reporte
      const response = await fetch(
        `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${selectedReporteId}/solucionar`,
        {
          method: "PUT", // Usamos el método PUT porque estamos actualizando un recurso
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: user.id, // Enviamos quién está solucionando el reporte
            solucion: solucion
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Solución registrada exitosamente");
        window.location.href = "reportes.html"; // Volvemos a la página de reportes
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al registrar la solución:", error);
      alert("Error de conexión. ¿Está el servidor corriendo?");
    }
  });

  // --- Inicialización: Cargamos los datos al abrir la página ---
  fetchReporteData();
});