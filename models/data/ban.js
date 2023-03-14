const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema para el baneo
const banSchema = new mongoose.Schema({
    _id: String,
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    userId: String,
    moderatorId: String,
    untilTimestamp: Number
});

//Añade el esquema al modelo
module.exports = mongoose.model('bans', banSchema);
