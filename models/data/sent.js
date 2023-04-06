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
        required: true
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

//Añade el esquema al modelo
module.exports = mongoose.model('sent', sentSchema);
