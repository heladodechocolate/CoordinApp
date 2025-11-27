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

    // Mostramos un mensaje de carga mientras obtenemos los datos
    reportesList.innerHTML = `<p>Cargando tareas reportadas...</p>`;

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
      
      // ¡CAMBIO CLAVE AQUÍ! Determinamos el estado visual basado en el campo accion
      // Si la acción es 'Cambiado de "reportado" a "revisado"', la tarjeta será verde
      const esRevisado = reporte.accion && reporte.accion.includes('Cambiado de "reportado" a "revisado"');
      const esSolucionado = reporte.estado === 'solucionado'; // También lo ocultamos si ya fue solucionado
      
      // Si el reporte ya fue solucionado, no lo mostramos en la lista
      if (esSolucionado) {
        console.log(`Reporte ${reporte.historial_id} fue solucionado. No se mostrará en la lista.`);
        return; // Usamos 'return' para saltar este reporte en el bucle
      }
      
      // Añadimos una clase especial si está revisado
      const cardClass = esRevisado ? 'event-card revisado-event' : 'event-card';
      
      html += `
        <div class="${cardClass}" data-historial-id="${reporte.historial_id}">
          <h4>ID: ${reporte.tarea_id} ${esRevisado ? '<span class="revisado-badge">REVISADO</span>' : ''}</h4>
          <p><strong>Fecha:</strong> ${reportDate}</p>
          <p><strong>Hora:</strong> ${reportTime}</p>
          <p><strong>Estado:</strong> ${reporte.estado}</p>
          <p><strong>Lugar:</strong> ${reporte.nombre_espacio}</p>
          <p><strong>Tarea:</strong> ${reporte.descripcion}</p>
          <p><strong>Reporte:</strong> ${reporte.reporte_detalles}</p>
          <div class="tarea-footer">
            <button class="revisado-btn" data-historial-id="${reporte.historial_id}" ${esRevisado ? 'disabled' : ''}>Revisado</button>
            <button class="solucion-btn" data-historial-id="${reporte.historial_id}">Solucion</button>
          </div>
        </div>
      `;
    });

    reportesList.innerHTML = html;
    console.log("HTML de reportes insertado en el DOM.");

    // Añadir event listeners a los botones de revisado
    document.querySelectorAll('.revisado-btn').forEach((btn) => {
      const historialId = btn.getAttribute('data-historial-id');
      console.log(`Añadiendo event listener al botón de revisado con data-historial-id: ${historialId}`);
      
      btn.addEventListener('click', () => {
        console.log(`Botón revisado presionado para el reporte con historial_id: ${historialId}`);
        marcarReporteComoRevisado(historialId);
      });
    });

    // Añadir event listeners a los botones de solucion
    document.querySelectorAll('.solucion-btn').forEach((btn) => {
      const historialId = btn.getAttribute('data-historial-id');
      console.log(`Añadiendo event listener al botón de solucion con data-historial-id: ${historialId}`);
      
      btn.addEventListener('click', () => {
        console.log(`Botón solucion presionado para el reporte con historial_id: ${historialId}`);
        // Guardamos el ID del reporte en localStorage para usarlo en la página de solución
        localStorage.setItem("selectedReporteId", historialId);
        // Redirigimos a la página de solución
        window.location.href = "solucionReporte.html";
      });
    });
  };

  // --- Función para marcar un reporte como revisado ---
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
        
        // CAMBIO CLAVE: En lugar de recargar la página, simplemente volvemos a llamar a la función que muestra los datos.
        // Esto reconstruirá el HTML con el estado actualizado de la BD.
        fetchAndDisplayReportes();
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