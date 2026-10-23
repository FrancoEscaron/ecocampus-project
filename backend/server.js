const express = require("express");
const mongoose = require("mongoose");

const app = express();
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