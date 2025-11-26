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

  // --- Función para mostrar los reportes en la lista ---
  const displayReportes = (reportes) => {
    if (reportes.length === 0) {
      reportesList.innerHTML = "<p>No hay tareas reportadas.</p>";
      return;
    }

    let html = '<div class="reportes-table-container">';
    html += '<table class="reportes-table">';
    html += '<thead>';
    html += '<tr>';
    html += '<th>ID Tarea</th>';
    html += '<th>Descripción</th>';
    html += '<th>Evento</th>';
    html += '<th>Reportado por</th>';
    html += '<th>Fecha</th>';
    html += '<th>Detalles</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    reportes.forEach((reporte) => {
      const reportDate = new Date(reporte.fecha_cambio).toLocaleString("es-ES");
      
      html += '<tr>';
      html += `<td>${reporte.id_tarea}</td>`;
      html += `<td>${reporte.descripcion_tarea}</td>`;
      html += `<td>${reporte.evento_titulo}</td>`;
      html += `<td>${reporte.nombre_usuario}</td>`;
      html += `<td>${reportDate}</td>`;
      html += `<td>${reporte.detalles}</td>`;
      html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
    html += '</div>';

    reportesList.innerHTML = html;
  };

  // --- Inicialización ---
  fetchAndDisplayReportes();
});