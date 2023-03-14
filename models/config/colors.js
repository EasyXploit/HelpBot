//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'colors'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    primary: {
        type: String,
        default: 'FEB526'
    },
    error: {
        type: String,
        default: 'F12F49'
    },
    secondaryError: {
        type: String,
        default: 'F04647'
    },
    correct: {
        type: String,
        default: '3EB57B'
    },
    secondaryCorrect: {
        type: String,
        default: 'B8E986'
    },
    warning: {
        type: String,
        default: 'F8A41E'
    },
    information: {
        type: String,
        default: 'C6C9C6'
    },
    logging: {
        type: String,
        default: '4A90E2'
    },
    polls: {
        type: String,
        default: '1689FC'
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('colors', schema);
