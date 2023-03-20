//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para la guild
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'welcomes',
        immutable: true
    },
    newMemberMode: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
        required: true
    },
    newBotRoleId: String,
    newMemberRoleId: String
});

//Añade el esquema al modelo
module.exports = mongoose.model('welcomes', schema, 'configs');
