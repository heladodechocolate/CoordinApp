const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const eventoRoutes = require("./routes/eventoRoutes");
const tareaRoutes = require("./routes/tareaRoutes");
const espacioRoutes = require("./routes/espacioRoutes");
const departamentoRoutes = require("./routes/departamentoRoutes");
const rolRoutes = require("./routes/rolRoutes"); 

const app = express();

// Middlewares
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // <-- Añade tu URL de frontend aquí
}));

app.use(express.json()); // Permite al servidor entender JSON

// Rutas
app.use("/api", authRoutes);
app.use("/api", eventoRoutes);
app.use("/api", tareaRoutes);
app.use("/api", espacioRoutes);
app.use("/api", departamentoRoutes);
app.use("/api", rolRoutes);

app.get("/", (req, res) => {
  res.send("¡Servidor de CoordinApp corriendo!");
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});