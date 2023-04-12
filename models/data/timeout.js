//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para el aislamiento
const timeoutSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, 
        unique: true,
        immutable: true
    },
    moderatorId: {
        type: String,
        required: true
    },
    untilTimestamp: {
        type: Number,
        required: true
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('timeout', timeoutSchema);
