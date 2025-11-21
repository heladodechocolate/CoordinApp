// En utils.js, reemplaza la función esAdminDeAdministracion por esta:

const esAdminDeAdministracion = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("DEPURACIÓN en utils.js: El objeto 'user' es:", user);

  if (!user) {
    console.log("DEPURACIÓN en utils.js: 'user' es null o undefined. Devolviendo false.");
    return false;
  }
  
  const isRolCorrect = user.rol === "Administrador";
  const isDeptoCorrect = user.departamento === "Administración";

  console.log(`DEPURACIÓN en utils.js: ¿user.rol es 'Administrador'? ${isRolCorrect}`);
  console.log(`DEPURACIÓN en utils.js: ¿user.departamento es 'Administración'? ${isDeptoCorrect}`);

  const resultado = isRolCorrect && isDeptoCorrect;
  console.log(`DEPURACIÓN en utils.js: Resultado final (AND): ${resultado}`);

  return resultado;
};