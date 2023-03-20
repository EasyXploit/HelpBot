const mongoose = require('mongoose');

//Crea un nuevo esquema para el silenciamiento
const muteSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'mute',
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
        type: String,
        required: true
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('mute', muteSchema);