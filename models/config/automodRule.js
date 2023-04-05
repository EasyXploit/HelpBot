//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para las reglas de automoderación
const schema = new mongoose.Schema({ 
    action: {
        type: String,
        enum: ['mute', 'kick', 'tempban', 'ban'],
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 5000
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    age: {
        type: Number,
        required: true,
        min: 5000
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('automodRule', schema);
