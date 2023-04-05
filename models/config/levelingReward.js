//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para las recompensas por subir de nivel
const schema = new mongoose.Schema({ 
    requiredLevel: {
        type: Number,
        required: true,
        min: 1
    },
    roles: {
        type: [String],
        required: true
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('levelingReward', schema);
