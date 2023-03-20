const mongoose = require('mongoose');

//Crea un nuevo esquema para el baneo
const banSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'ban',
        immutable: true
    },
    userId: {
        type: String,
        required: true
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

//Añade el esquema al modelo
module.exports = mongoose.model('ban', banSchema);
