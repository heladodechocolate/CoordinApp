// Frontend/js/reportes.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const backBtn = document.getElementById("back-btn");
  const cargarDatosBtn = document.getElementById("cargar-datos-btn");
  const cuadroPrueba = document.getElementById("cuadro-prueba");

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

  // --- Función para cargar y mostrar los datos de prueba ---
  const cargarDatosDePrueba = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Mostrar mensaje de carga
    cuadroPrueba.innerHTML = '<p>Cargando datos...</p>';

    try {
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/reportes/prueba-historial", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("No se pudieron cargar los datos");

      const data = await response.json();
      
      // Mostrar los resultados en el cuadro de prueba
      let html = `<p><strong>Total de registros:</strong> ${data.totalRegistros}</p>`;
      html += '<p><strong>Primeros 5 registros:</strong></p>';
      html += '<pre style="background-color: #eee; padding: 10px; overflow-x: auto;">';
      
      // Mostrar los primeros 5 registros en formato JSON para facilitar la visualización
      const primeros5 = data.datos.slice(0, 5);
      html += JSON.stringify(primeros5, null, 2);
      
      html += '</pre>';
      
      // También mostrar los datos en la consola del navegador
      console.log('Datos de historial_cambios:', data);
      
      cuadroPrueba.innerHTML = html;
    } catch (error) {
      console.error("Error al cargar datos de prueba:", error);
      cuadroPrueba.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    }
  };

  // Agregar evento al botón
  cargarDatosBtn.addEventListener("click", cargarDatosDePrueba);
});