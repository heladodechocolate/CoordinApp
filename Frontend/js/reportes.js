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

    // Añadir event listeners a los botones de revisado (usando la misma lógica que en vistaDiaria.js)
    document.querySelectorAll('.revisado-btn').forEach((btn) => {
      const reporteId = btn.getAttribute('data-id');
      console.log(`Añadiendo event listener al botón con data-id: ${reporteId}`);
      
      btn.addEventListener('click', () => {
        console.log(`Botón revisado presionado para el reporte con ID: ${reporteId}`);
        
        // Usamos la misma lógica que en los botones de completar y reportar tarea
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

        // Deshabilitar el botón para evitar clics múltiples
        btn.disabled = true;
        btn.textContent = 'Marcando...';

        try {
          console.log(`Enviando solicitud PUT a /api/reportes/${reporteId}/revisado`);
          fetch(`https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/${reporteId}/revisado`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => {
            console.log('Respuesta del servidor recibida. Status:', response.status);
            return response.json();
          })
          .then(data => {
            console.log('Datos de respuesta del servidor:', data);
            
            if (data.message) {
              alert('Reporte marcado como revisado exitosamente.');
              
              // Actualizar la UI para reflejar el cambio
              const reporteCard = document.getElementById(`reporte-${reporteId}`);
              if (reporteCard) {
                reporteCard.style.opacity = '0.6';
                reporteCard.style.border = '2px solid #2ecc71';
              }
              
              btn.textContent = 'Revisado';
              btn.style.backgroundColor = '#95a5a6';
            } else {
              console.error("Error en la respuesta del servidor:", data);
              alert(`Error: ${data.message || 'Error desconocido'}`);
              
              // Si hay error, volvemos a habilitar el botón
              btn.disabled = false;
              btn.textContent = 'Revisado';
            }
          })
          .catch(error => {
            console.error('Error al marcar reporte como revisado:', error);
            alert('Error de conexión. Inténtalo de nuevo.');
            
            // Si hay error, volvemos a habilitar el botón
            btn.disabled = false;
            btn.textContent = 'Revisado';
          });
        } catch (error) {
          console.error('Error al marcar reporte como revisado:', error);
          alert('Error de conexión. Inténtalo de nuevo.');
          
          // Si hay error, volvemos a habilitar el botón
          btn.disabled = false;
          btn.textContent = 'Revisado';
        }
      });
    });
  };

  // --- Inicialización ---
  console.log("Iniciando carga inicial de reportes...");
  fetchAndDisplayReportes();
});