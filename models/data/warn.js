const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema para la advertencia
const warnSchema = new mongoose.Schema({
    _id: String,
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    userId: String,
    timestamp: Number,
    reason: String,
    moderatorId: String
});

//Añade el esquema al modelo
module.exports = mongoose.model('warn', warnSchema);
