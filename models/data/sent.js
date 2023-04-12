//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para el envío
const sentSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    messageId: String,
    lastSentTimestamp: Number
});

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('sent', sentSchema);
