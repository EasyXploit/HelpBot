//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para el envío
const sentSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'sent',
        immutable: true
    },
    messageHash: {
        type: String,
        required: true,
        immutable: true
    },
    messageId: {
        type: String,
        required: true
    },
    lastSentTimestamp: {
        type: Number,
        required: true
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('sent', sentSchema);
