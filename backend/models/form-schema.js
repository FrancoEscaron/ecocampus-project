const mongoose = require("mongoose");

const formSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    correo: { type: String, required: true, trim: true, lowercase: true },
    mensaje: { type: String, required: true },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = mongoose.model("Form", formSchema)