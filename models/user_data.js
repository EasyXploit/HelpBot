/*
    NOTAS:
    user_data (documento por usuario)
        warns [{}]
            statistics [{}]
            inventory [{}]
*/

//Requiere la dependencia para comuniarse con el SGBD.
const mongoose = require('mongoose');

//Genera una estructura a partir de los valores por defecto
const userDataStructure = {
    _id: String,
    key: {
        type: Boolean,
        default: True
    }
};

//Genera un esquema a partir de la estructura generada, y lo añadel al modelo
module.exports = mongoose.model('guildSettings', mongoose.Schema(userDataStructure));
