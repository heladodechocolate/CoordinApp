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
        <div class="reporte-card">
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

    // Agregar event listeners a los botones de revisado (aunque por ahora no hagan nada)
    document.querySelectorAll('.revisado-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('Botón revisado presionado para el reporte con ID:', e.target.getAttribute('data-id'));
        // Por ahora, el botón no hace nada, pero ya está preparado para futuras funcionalidades
      });
    });
  };

  // --- Inicialización ---
  fetchAndDisplayReportes();
});