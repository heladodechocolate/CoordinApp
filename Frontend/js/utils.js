// En utils.js

const esAdminDeAdministracion = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return false;
  }

  // El rol es "Administrador" (con tilde)
  const isRolCorrect = user.rol === "Administrador";

  // El departamento es "Administracion" (sin tilde, como en la BD)
  const isDeptoCorrect = user.departamento === "Administracion";

  return isRolCorrect && isDeptoCorrect;
};
