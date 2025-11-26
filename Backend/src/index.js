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

app.use(cors({ origin: true })); 

app.use(express.json()); // Permite al servidor entender JSON
app.use(express.urlencoded({ extended: true })); // Para poder leer form-urlencoded (las de JMeter)

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

// Agrega esta línea antes de app.listen
app.get("/api/rutas", (req, res) => {
  res.json({
    message: "Rutas disponibles",
    rutas: app._router.stack
      .filter(r => r.route)
      .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }))
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});