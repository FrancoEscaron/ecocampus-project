const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb://localhost:27017/EcoCampus"
const conectarDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log("Base de datos conectada");
    } catch (error) {
        console.error("Error conectando MongoDB:", error.message);
        process.exit(1);
    }
}

conectarDB();

const formRoutes = require("./routes/formRoutes");
app.use("/api", formRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Servidor corriendo en el puerto ${PORT}');
});