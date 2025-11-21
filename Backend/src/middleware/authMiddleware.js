// authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntamos el payload del token (id, rol) a la petición
    next();
  } catch (error) {
    res.status(401).json({ message: "Token no válido." });
  }
};

module.exports = authMiddleware;
