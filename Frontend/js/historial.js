document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos del DOM ---
    const backBtn = document.getElementById("back-btn");
    const searchInput = document.getElementById("search-input");
    const historialList = document.getElementById("historial-list");

    // --- Estado de la Aplicación ---
    let eventos = []; // Array para guardar todos los eventos

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

    // --- Lógica de Carga y Filtrado de Eventos ---
    const fetchAndDisplayEventos = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // Obtenemos todos los eventos
            const response = await fetch("http://127.0.0.1:3001/api/eventos", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("No se pudieron cargar los eventos");

            eventos = await response.json();

            // Ordenamos los eventos de más reciente a más antiguo
            eventos.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));

            // Mostramos los eventos en la lista
            displayEventos(eventos);
        } catch (error) {
            console.error("Error al cargar eventos:", error);
            historialList.innerHTML = "<p>No se pudieron cargar los eventos. Revisa la consola para más detalles.</p>";
        }
    };

    const displayEventos = (eventosToDisplay) => {
        historialList.innerHTML = ""; // Limpiamos la lista anterior

        if (eventosToDisplay.length === 0) {
            historialList.innerHTML = "<p>No se encontraron eventos.</p>";
            return;
        }

        eventosToDisplay.forEach((evento) => {
            const eventCard = document.createElement("div");
            eventCard.className = "event-card";

            const eventDate = new Date(evento.fecha_inicio).toLocaleDateString("es-ES");

            // Creamos el HTML para cada evento en la lista
            eventCard.innerHTML = `
                <p><strong>ID:</strong> ${evento.id}</p>
                <p><strong>Evento:</strong> ${evento.titulo}</p>
                <p><strong>Fecha:</strong> ${eventDate}</p>
                <button class="details-btn" data-event-id="${evento.id}">Detalles</button>
            `;

            historialList.appendChild(eventCard);
        });

        // Por ahora, los botones de "Detalles" no tendrán funcionalidad
        // pero los preparamos para el futuro
        document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const eventId = btn.getAttribute("data-event-id");
        console.log(`Se ha hecho clic en detalles para el evento con ID: ${eventId}`);
        
        // NUEVO: Guardamos el ID del evento y redirigimos a la página de detalles
        localStorage.setItem("selectedEventoId", eventId);
        window.location.href = "detalleEvento.html";
    });
});
    };

    // --- Lógica de Búsqueda ---
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const filteredEventos = eventos.filter((evento) => {
            const tituloMatch = evento.titulo.toLowerCase().includes(searchTerm);
            const idMatch = evento.id.toString().includes(searchTerm);
            return tituloMatch || idMatch;
        });

        displayEventos(filteredEventos);
    });

    // --- Inicialización ---
    fetchAndDisplayEventos();
});