const mongoose = require('mongoose');

//Crea un nuevo esquema para la advertencia
const warnSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'warn',
        immutable: true
    },
    userId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    moderatorId: {
        type: String,
        required: true
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('warn', warnSchema);
