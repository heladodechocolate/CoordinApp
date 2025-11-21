// Esperamos a que todo el contenido de la página se haya cargado
document.addEventListener("DOMContentLoaded", () => {
  // 1. Seleccionamos el formulario y el elemento donde mostraremos errores
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("error-message");

  // 2. Escuchamos el evento 'submit' del formulario
  loginForm.addEventListener("submit", async (event) => {
    // Prevenimos que el formulario se envíe de la forma tradicional (que recarga la página)
    event.preventDefault();

    // 3. Obtenemos los valores de los campos de email y contraseña
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Limpiamos cualquier mensaje de error anterior
    errorMessage.textContent = "";

    try {
      // 4. Enviamos los datos al backend usando la API Fetch
      const response = await fetch("http://127.0.0.1:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Convertimos el objeto a una cadena JSON
      });

      const data = await response.json();

      // 5. Evaluamos la respuesta del servidor
      if (response.ok) {
        // Si la respuesta es exitosa (código 200-299)
        // ¡Login exitoso!
        console.log("Login exitoso:", data);

        // Guardamos el token y los datos del usuario en el localStorage
        // Esto es como si el usuario guardara su ticket de entrada en el bolsillo
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirigimos al usuario a la página principal
        window.location.href = "index.html";
      } else {
        // Si hay un error (ej. 401 Unauthorized)
        // Mostramos el mensaje de error que viene del backend
        console.error("Error del servidor:", data); // <-- AÑADE ESTA LÍNEA
        errorMessage.textContent = data.message || "Error desconocido.";
      }
    } catch (error) {
      // Si hay un error de red o de otro tipo
      console.error("Error de conexión:", error);
      errorMessage.textContent =
        "Error de conexión. ¿Está el servidor corriendo?";
    }
  });


  // --- Lógica del Botón "Crear Cuenta" ---
    const createAccountBtn = document.getElementById("create-account-btn");
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            window.location.href = "crearCuenta.html";
        });
    }
});
