//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema para la guild
const guildSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'welcomes'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    newMemberMode: {
        type: Number,
        default: 0
    },
    newBotRole: String,
    newMemberRole: String,
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('welcomes', guildSchema);
