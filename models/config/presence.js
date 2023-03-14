//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Almacena las traducciones al idioma configurado
//const locale = require(`../../resources/locales/${require('./configs/main.json').locale}.json`).models.config.presence;

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'presence'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    name: {
        type: String,
        default: locale.name
    },
    membersCount: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'online'
    },
    type: {
        type: String,
        default: 'WATCHING'
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('presence', schema);
