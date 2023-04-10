//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para las bienvenidas
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

//Genera un modelo a partir del esquema y lo exporta como módulo por defecto
module.exports.default = mongoose.model('welcomes', schema, 'configs');
