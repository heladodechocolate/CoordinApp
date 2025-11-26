// Frontend/js/reportes.js - VERSIÓN DE DEPURACIÓN

console.log("reportes.js se está cargando...");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM completamente cargado.");

  // --- Elementos del DOM ---
  const backBtn = document.getElementById("back-btn");
  const reportesList = document.getElementById("reportes-list");

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    console.log("Usuario no autenticado, redirigiendo a login.html");
    window.location.href = "login.html";
    return;
  }
  console.log("Usuario autenticado:", user);

  // --- Lógica de Botones ---
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("Botón de regresar presionado.");
      window.location.href = "index.html";
    });
  } else {
    console.error("ERROR: No se encontró el botón de regresar.");
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
      console.log("Realizando fetch a /api/reportes/tareas-reportadas...");
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/tareas-reportadas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respuesta recibida:", response.status);

      if (!response.ok) {
        throw new Error("No se pudieron cargar los reportes");
      }

      const reportes = await response.json();
      console.log("Reportes obtenidos:", reportes);
      displayReportes(reportes);
    } catch (error) {
      console.error("Error en fetchAndDisplayReportes:", error);
      reportesList.innerHTML = "<p>No se pudieron cargar los reportes. Intente nuevamente.</p>";
    }
  };

  // --- Función para mostrar los reportes en tarjetas ---
  const displayReportes = (reportes) => {
    console.log("Iniciando displayReportes con", reportes.length, "reportes.");
    if (reportes.length === 0) {
      reportesList.innerHTML = "<p>No hay tareas reportadas.</p>";
      return;
    }

    let html = '<div class="reportes-grid">';

    reportes.forEach((reporte, index) => {
      const reportDate = new Date(reporte.fecha_cambio).toLocaleString("es-ES");
      
      html += `
        <div class="reporte-card" id="reporte-${reporte.id}">
          <header class="reporte-header">
            <h3>Evento: ${reporte.evento_titulo}</h3>
          </header>
          
          <div class="reporte-body">
            <div class="reporte-field">
              <span class="field-label">ID Tarea:</span>
              <span class="field-value">${reporte.id_tarea}</span>
            </div>
            
            <div class="reporte-field">
              <span class="field-label">Fecha:</span>
              <span class="field-value">${reportDate}</span>
            </div>
            
            <div class="reporte-field">
              <span class="field-label">Tarea:</span>
              <span class="field-value">${reporte.descripcion_tarea}</span>
            </div>
            
            <div class="reporte-field">
              <span class="field-label">Reportado por:</span>
              <span class="field-value">${reporte.nombre_usuario}</span>
            </div>
            
            <div class="reporte-field">
              <span class="field-label">Detalles:</span>
              <span class="field-value">${reporte.detalles}</span>
            </div>
          </div>
          
          <footer class="reporte-footer">
            <button class="revisado-btn" data-id="${reporte.id}">Revisado</button>
          </footer>
        </div>
      `;
    });

    html += '</div>';
    reportesList.innerHTML = html;
    console.log("HTML de reportes insertado en el DOM.");

    // Agregar event listeners a los botones de revisado
    const botonesRevisado = document.querySelectorAll('.revisado-btn');
    console.log("Se encontraron", botonesRevisado.length, "botones de revisado.");

    botonesRevisado.forEach((btn, index) => {
      console.log(`Añadiendo event listener al botón ${index + 1} con data-id:`, btn.getAttribute('data-id'));
      
      btn.addEventListener('click', async (e) => {
        console.log("¡¡¡¡CLIK EN EL BOTÓN REVISADO!!!");
        console.log("Evento click:", e);
        console.log("Botón presionado:", e.target);
        
        const reporteId = e.target.getAttribute('data-id');
        console.log('ID del reporte:', reporteId);
        
        // Confirmación antes de realizar la acción
        const confirmacion = confirm('¿Estás seguro de que quieres marcar este reporte como revisado?');
        console.log('Resultado de la confirmación:', confirmacion);
        if (!confirmacion) {
          console.log("Usuario canceló la acción.");
          return;
        }

        console.log("Usuario confirmó la acción. Continuando...");
        
        // Deshabilitar el botón para evitar clics múltiples
        e.target.disabled = true;
        e.target.textContent = 'Marcando...';
        console.log("Botón deshabilitado y texto cambiado.");

        const token = localStorage.getItem('token');
        console.log('Token para la solicitud:', token);

        const url = `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${reporteId}/revisado`;
        console.log('URL de la solicitud:', url);
        
        try {
          console.log("Iniciando fetch...");
          const response = await fetch(url, {
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
            console.log("Éxito. Actualizando la UI.");
            // Opcional: cambiar la apariencia de la tarjeta para indicar que fue revisada
            const reporteCard = document.getElementById(`reporte-${reporteId}`);
            if (reporteCard) {
              reporteCard.style.opacity = '0.6';
              reporteCard.style.border = '2px solid #2ecc71';
            }
            e.target.textContent = 'Revisado';
            e.target.style.backgroundColor = '#95a5a6'; // Color gris para indicar que ya no se puede usar
          } else {
            console.error("Error en la respuesta del servidor:", data);
            alert(`Error: ${data.message}`);
            // Si hay error, volvemos a habilitar el botón
            e.target.disabled = false;
            e.target.textContent = 'Revisado';
          }
        } catch (error) {
          console.error('Error al marcar reporte como revisado:', error);
          alert('Error de conexión. Inténtalo de nuevo.');
          // Si hay error, volvemos a habilitar el botón
          e.target.disabled = false;
          e.target.textContent = 'Revisado';
        }
      });
    });
  };

  // --- Inicialización ---
  console.log("Iniciando carga inicial de reportes...");
  fetchAndDisplayReportes();
});