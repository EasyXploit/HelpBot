const mongoose = require('mongoose');

//Crea un nuevo esquema para la encuesta
const pollSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'poll',
        immutable: true
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
    expirationTimestamp: {
        type: Number,
        required: true
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('poll', pollSchema);