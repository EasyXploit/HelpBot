//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para la encuesta
const pollSchema = new mongoose.Schema({
    pollId: {
        type: String,
        required: true, 
        unique: true
    },
    channelId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    options: {
        type: String,
        required: true
    },
    expirationTimestamp: Number
});

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('poll', pollSchema);