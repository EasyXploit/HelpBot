const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema para la encuesta
const pollSchema = new mongoose.Schema({
    _id: String,
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    channelId: String,
    messageId: String,
    authorId: String,
    title: String,
    options: String,
    expirationTimestamp: Number
});

//Añade el esquema al modelo
module.exports = mongoose.model('polls', pollSchema);