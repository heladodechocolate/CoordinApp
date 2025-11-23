// Frontend/js/historial.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const backBtn = document.getElementById("back-btn");
  const searchInput = document.getElementById("search-input");
  const historialList = document.getElementById("historial-list");

  // --- Lógica de Autenticación ---
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // --- Lógica de Botones ---
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html"; // Redirigimos al index.html
  });

  // --- Función para cargar y mostrar los eventos ---
  const fetchAndDisplayEventos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/eventos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("No se pudieron cargar los eventos");

      const eventos = await response.json();
      displayEventos(eventos);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      historialList.innerHTML = "<p>No se pudieron cargar los eventos. Intente nuevamente.</p>";
    }
  };

  // --- Función para mostrar los eventos en la lista ---
  const displayEventos = (eventos) => {
    if (eventos.length === 0) {
      historialList.innerHTML = "<p>No hay eventos registrados.</p>";
      return;
    }

    let html = "";
    eventos.forEach((evento) => {
      const eventDate = new Date(evento.fecha_inicio).toLocaleDateString("es-ES");
      const eventTime = new Date(evento.fecha_inicio).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      html += `
        <div class="event-card" data-event-id="${evento.id}">
          <h4>${evento.titulo}</h4>
          <p><strong>ID:</strong> ${evento.id}</p>
          <p><strong>Fecha:</strong> ${eventDate}</p>
          <p><strong>Hora:</strong> ${eventTime}</p>
          <p><strong>Estado:</strong> ${evento.estado}</p>
          <p><strong>Lugar:</strong> ${evento.nombre_espacio}</p>
          <button class="view-details-btn" data-event-id="${evento.id}">Ver Detalles</button>
        </div>
      `;
    });

    historialList.innerHTML = html;

    // Añadir event listeners a los botones de detalles
    document.querySelectorAll(".view-details-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const eventId = btn.getAttribute("data-event-id");
        localStorage.setItem("selectedEventoId", eventId);
        window.location.href = "detalleEvento.html";
      });
    });
  };

  // --- Lógica de Búsqueda ---
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const eventCards = document.querySelectorAll(".event-card");

    eventCards.forEach((card) => {
      const title = card.querySelector("h4").textContent.toLowerCase();
      const id = card.querySelector("p").textContent.toLowerCase();
      
      if (title.includes(searchTerm) || id.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });

  // --- Inicialización ---
  fetchAndDisplayEventos();
});