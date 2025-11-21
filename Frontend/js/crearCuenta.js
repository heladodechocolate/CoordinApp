// Frontend/js/crearCuenta.js
document.addEventListener("DOMContentLoaded", () => {
    const createAccountForm = document.getElementById("create-account-form");
    const errorMessage = document.getElementById("error-message");
    const rolSelect = document.getElementById("rol");
    const departamentoSelect = document.getElementById("departamento");
    const adminCodeContainer = document.getElementById("admin-code-container");

    // --- Lógica para mostrar/ocultar el campo de código de administrador ---
    const checkAdminRole = () => {
        const selectedRolValue = rolSelect.value;
        const selectedDeptoValue = departamentoSelect.value;

        // Mostramos el campo si es rol "1" (Administrador) Y depto "1" (Administración)
        if (selectedRolValue === "1" && selectedDeptoValue === "1") {
            adminCodeContainer.style.display = "block";
        } else {
            adminCodeContainer.style.display = "none";
        }
    };

    rolSelect.addEventListener("change", checkAdminRole);
    departamentoSelect.addEventListener("change", checkAdminRole);

    // --- Cargar Roles y Departamentos desde la API ---
    const cargarDatosIniciales = async () => {
        try {
            // Usamos los endpoints que ya existen en tu backend
            const [rolesResponse, departamentosResponse] = await Promise.all([
                fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/roles"), // Necesitaremos crear este endpoint
                fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/departamentos") // Este ya existe
            ]);

            if (rolesResponse.ok) {
                const roles = await rolesResponse.json();
                roles.forEach(rol => {
                    const option = document.createElement("option");
                    option.value = rol.id;
                    option.textContent = rol.nombre_rol;
                    rolSelect.appendChild(option);
                });
            }

            if (departamentosResponse.ok) {
                const departamentos = await departamentosResponse.json();
                departamentos.forEach(depto => {
                    const option = document.createElement("option");
                    option.value = depto.id;
                    option.textContent = depto.nombre;
                    departamentoSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            errorMessage.textContent = "No se pudieron cargar los datos necesarios.";
        }
    };

    // --- Lógica de Envío del Formulario ---
    createAccountForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        errorMessage.textContent = "";

        const formData = new FormData(createAccountForm);
        const payload = {
            nombre: formData.get("nombre"),
            email: formData.get("email"),
            password: formData.get("password"),
            id_rol: parseInt(formData.get("id_rol")),
            id_departamento: parseInt(formData.get("id_departamento")),
            adminCode: formData.get("admin-code") // <-- Enviamos el código, sea cual sea
        };

        try {
            const response = await fetch("https://quiet-atoll-75129-3a74a1556369.herokuapp.com/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
                window.location.href = "login.html";
            } else {
                errorMessage.textContent = data.message || "Error al crear la cuenta.";
            }
        } catch (error) {
            console.error("Error al crear cuenta:", error);
            errorMessage.textContent = "Error de conexión. ¿Está el servidor corriendo?";
        }
    });

    // --- Inicialización ---
    cargarDatosIniciales();
});