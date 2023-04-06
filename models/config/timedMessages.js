//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para los mensajes programados
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'timedMessages',
        immutable: true
    },
    configuredMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'timedMessageSchema'
    }]
});

//Añade el esquema al modelo
module.exports = mongoose.model('timedMessages', schema, 'configs');
