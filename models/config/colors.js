//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para los colores
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'colors',
        immutable: true
    },
    primary: {
        type: String,
        default: 'FEB526',
        required: true
    },
    error: {
        type: String,
        default: 'F12F49',
        required: true
    },
    secondaryError: {
        type: String,
        default: 'F04647',
        required: true
    },
    correct: {
        type: String,
        default: '3EB57B',
        required: true
    },
    secondaryCorrect: {
        type: String,
        default: 'B8E986',
        required: true
    },
    warning: {
        type: String,
        default: 'F8A41E',
        required: true
    },
    information: {
        type: String,
        default: 'C6C9C6',
        required: true
    },
    logging: {
        type: String,
        default: '4A90E2',
        required: true
    },
    polls: {
        type: String,
        default: '1689FC',
        required: true
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo
export default mongoose.model('colors', schema, 'configs');
