// Frontend/js/reportes.js
console.log("reportes.js se está cargando...");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM completamente cargado.");

  // --- Elementos del DOM ---
  const backBtn = document.getElementById("back-btn");
  const reportesList = document.getElementById("reportes-list");
  const botonPrueba = document.getElementById("boton-prueba-revisado");

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    console.log("Usuario no autenticado, redirigiendo a login.html");
    window.location.href = "login.html";
    return;
  }
  console.log("Usuario autenticado:", user);

  // --- Lógica del Botón de Prueba ---
  if (botonPrueba) {
    botonPrueba.addEventListener("click", async () => {
      console.log("¡Botón de prueba presionado!");
      
      const confirmacion = confirm('¿Estás seguro de que quieres probar la función con el ID 6?');
      if (!confirmacion) {
        console.log("Usuario canceló la acción.");
        return;
      }

      botonPrueba.disabled = true;
      botonPrueba.textContent = 'Probando...';

      const token = localStorage.getItem('token');
      const reporteId = 6; // ID fijo para la prueba
      
      console.log('Enviando solicitud a:', `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${reporteId}/revisado`);
      console.log('Con token:', token);

      try {
        console.log("Iniciando fetch...");
        const response = await fetch(`https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${reporteId}/revisado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Respuesta del servidor recibida. Status:', response.status);
        const data = await response.json();
        console.log('Datos de respuesta del servidor:', data);

        if (response.ok) {
          alert('¡Éxito! La solicitud PUT funcionó correctamente.');
          botonPrueba.textContent = '¡Éxito!';
          botonPrueba.style.backgroundColor = '#2ecc71';
        } else {
          console.error("Error en la respuesta del servidor:", data);
          alert(`Error: ${data.message}`);
          botonPrueba.disabled = false;
          botonPrueba.textContent = 'Probar Función Revisar con ID 6';
          botonPrueba.style.backgroundColor = '#e74c3c';
        }
      } catch (error) {
        console.error('Error al marcar reporte como revisado:', error);
        alert('Error de conexión. Inténtalo de nuevo.');
        botonPrueba.disabled = false;
        botonPrueba.textContent = 'Probar Función Revisar con ID 6';
        botonPrueba.style.backgroundColor = '#e74c3c';
      }
    });
  } else {
    console.error("ERROR: No se encontró el botón de prueba.");
  }

  // --- Lógica de Botones ---
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("Botón de regresar presionado.");
      window.location.href = "index.html";
    });
  } else {
    console.error("ERROR: No se encontró el botón de regreso.");
  }

  // --- Función para cargar y mostrar los reportes ---
  const fetchAndDisplayReportes = async () => {
    console.log("Iniciando fetchAndDisplayReportes...");
    const token = localStorage.getItem("token");
    console.log("Token obtenido:", token);
    if (!token) {
      console.error("No se encontró el token.");
      return;
    }

    try {
      // CAMBIADO: Usamos el nuevo endpoint para obtener los detalles de las tareas reportadas
      console.log("Realizando fetch a /api/reportes/detalles-tareas-reportadas...");
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/detalles-tareas-reportadas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respuesta recibida:", response.status);

      if (!response.ok) {
        throw new Error("No se pudieron cargar los detalles de las tareas reportadas");
      }

      const reportes = await response.json();
      console.log("Detalles de tareas reportadas obtenidos:", reportes);
      displayReportes(reportes);
    } catch (error) {
      console.error("Error en fetchAndDisplayReportes:", error);
      reportesList.innerHTML = "<p>No se pudieron cargar los detalles de las tareas reportadas. Intente nuevamente.</p>";
    }
  };

  // --- Función para mostrar los reportes en tarjetas ---
  const displayReportes = (reportes) => {
    console.log("Iniciando displayReportes con", reportes.length, "reportes.");
    if (reportes.length === 0) {
      reportesList.innerHTML = "<p>No hay tareas reportadas.</p>";
      return;
    }

    let html = "";

    reportes.forEach((reporte) => {
      const reportDate = new Date(reporte.fecha_inicio).toLocaleDateString("es-ES");
      const reportTime = new Date(reporte.reporte_fecha).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      
      html += `
        <div class="event-card" data-historial-id="${reporte.historial_id}">
          <h4>ID: ${reporte.tarea_id}</h4>
          <p><strong>Fecha:</strong> ${reportDate}</p>
          <p><strong>Hora:</strong> ${reportTime}</p>
          <p><strong>Estado:</strong> ${reporte.estado}</p>
          <p><strong>Lugar:</strong> ${reporte.nombre_espacio}</p>
          <p><strong>Tarea:</strong> ${reporte.descripcion}</p>
          <p><strong>Reporte:</strong> ${reporte.reporte_detalles}</p>
          <div class="tarea-footer">
            <button class="revisado-btn" data-historial-id="${reporte.historial_id}">Revisado</button>
          </div>
        </div>
      `;
    });

    reportesList.innerHTML = html;
    console.log("HTML de reportes insertado en el DOM.");

    // Añadir event listeners a los botones de revisado
    document.querySelectorAll('.revisado-btn').forEach((btn) => {
      const historialId = btn.getAttribute('data-historial-id');
      console.log(`Añadiendo event listener al botón con data-historial-id: ${historialId}`);
      
      btn.addEventListener('click', () => {
        console.log(`Botón revisado presionado para el reporte con historial_id: ${historialId}`);
        marcarReporteComoRevisado(historialId);
      });
    });
  };

  // --- Función para marcar un reporte como revisado (usando la misma lógica que en reportarTarea.js) ---
  const marcarReporteComoRevisado = async (historialId) => {
    console.log(`Marcando reporte ${historialId} como revisado...`);
    
    const confirmacion = confirm('¿Estás seguro de que quieres marcar este reporte como revisado?');
    if (!confirmacion) {
      console.log("Usuario canceló la acción.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No se encontró el token de autenticación.");
      return;
    }

    try {
      console.log(`Enviando solicitud PUT a /api/reportes/${historialId}/revisado`);
      const response = await fetch(`https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${historialId}/revisado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta del servidor recibida. Status:', response.status);
      const data = await response.json();
      console.log('Datos de respuesta del servidor:', data);

      if (response.ok) {
        alert('Reporte marcado como revisado exitosamente.');
        // Actualizar la UI para reflejar el cambio
        const reporteCard = document.querySelector(`[data-historial-id="${historialId}"]`);
        if (reporteCard) {
          reporteCard.style.opacity = '0.6';
          reporteCard.style.border = '2px solid #2ecc71';
          const boton = reporteCard.querySelector('.revisado-btn');
          if (boton) {
            boton.textContent = 'Revisado';
            boton.style.backgroundColor = '#95a5a6';
            boton.disabled = true;
          }
        }
      } else {
        console.error("Error en la respuesta del servidor:", data);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al marcar reporte como revisado:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  // --- Inicialización ---
  console.log("Iniciando carga inicial de reportes...");
  fetchAndDisplayReportes();
});