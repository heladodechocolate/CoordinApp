// Frontend/js/reportes.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const backBtn = document.getElementById("back-btn");
  const reportesList = document.getElementById("reportes-list");

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // --- Lógica de Botones ---
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // --- Función para cargar y mostrar los reportes ---
  const fetchAndDisplayReportes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/tareas-reportadas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("No se pudieron cargar los reportes");

      const reportes = await response.json();
      displayReportes(reportes);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      reportesList.innerHTML = "<p>No se pudieron cargar los reportes. Intente nuevamente.</p>";
    }
  };

  // --- Función para mostrar los reportes en tarjetas ---
  const displayReportes = (reportes) => {
    if (reportes.length === 0) {
      reportesList.innerHTML = "<p>No hay tareas reportadas.</p>";
      return;
    }

    let html = '<div class="reportes-grid">';

    reportes.forEach((reporte) => {
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

    // Agregar event listeners a los botones de revisado
    document.querySelectorAll('.revisado-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reporteId = e.target.getAttribute('data-id');
        const reporteCard = document.getElementById(`reporte-${reporteId}`);
        
        console.log('Botón revisado presionado para el reporte con ID:', reporteId);
        
        // Confirmación antes de realizar la acción
        if (!confirm('¿Estás seguro de que quieres marcar este reporte como revisado?')) {
          return;
        }

        // Deshabilitar el botón para evitar clics múltiples
        e.target.disabled = true;
        e.target.textContent = 'Marcando...';

        const token = localStorage.getItem('token');
        
        console.log('Enviando solicitud a:', `https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${reporteId}/revisado`);
        console.log('Con token:', token);

        try {
          const response = await fetch(`https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${reporteId}/revisado`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Respuesta del servidor:', response.status);
          const data = await response.json();
          console.log('Datos de respuesta:', data);

          if (response.ok) {
            alert('Reporte marcado como revisado exitosamente.');
            // Opcional: cambiar la apariencia de la tarjeta para indicar que fue revisada
            reporteCard.style.opacity = '0.6';
            reporteCard.style.border = '2px solid #2ecc71';
            e.target.textContent = 'Revisado';
            e.target.style.backgroundColor = '#95a5a6'; // Color gris para indicar que ya no se puede usar
          } else {
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
  fetchAndDisplayReportes();
});