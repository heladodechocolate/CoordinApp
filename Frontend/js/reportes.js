  // Frontend/js/vistaDiaria.js

  document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos del DOM ---
    const backBtn = document.getElementById("back-btn");
    const selectedDateDisplay = document.getElementById("selected-date-display");

    // --- Lógica de Autenticación y Carga Inicial ---
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    
    // --- Lógica de Botones ---
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });


    // --- INICIO DE LA PRUEBA AISLADA ---
    console.log("--- DEPURACIÓN: Iniciando la verificación de permisos ---");

    const userFromStorage = JSON.parse(localStorage.getItem("user"));
    console.log("--- DEPURACIÓN: Objeto 'user' completo desde localStorage ---");
    console.log(userFromStorage); // <-- ¡MIRA ESTO EN LA CONSOLA!
    console.log("--- FIN DE LA DEPURACIÓN ---");


    // Obtener la fecha seleccionada desde el localStorage
    const selectedDate = localStorage.getItem("selectedDate");
    if (!selectedDate) {
      window.location.href = "index.html";
      return;
    }

    // Formatear y mostrar la fecha seleccionada en el header
    const dateObj = new Date(selectedDate + "T00:00:00");
    selectedDateDisplay.textContent = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });


    // --- Inicialización ---
    fetchAndDisplayEvents();
  });