//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'presence',
        immutable: true
    },
    showText: String,
    membersCount: {
        type: Boolean,
        default: true,
        required: true
    },
    status: {
        type: String,
        default: 'online',
        enum: ['online', 'idle', 'offline', 'dnd'],
        required: true
    },
    type: {
        type: String,
        default: 'WATCHING',
        enum: ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM', 'COMPETING']
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('presence', schema, 'configs');
