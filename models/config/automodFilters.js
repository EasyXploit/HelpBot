//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Almacena las traducciones al idioma configurado
//const locale = require(`../../resources/locales/${require('./configs/main.json').locale}.json`).models.config.automodFilters;

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'automodFilters'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    flood: {
        status: false,
        action: 3,
        reason: locale.flood.reason,
        bypassIds: [],
        triggerLimit: 5,
        maxTimeBetween: 2000
    },
    crossPost: {
        status: true,
        action: 3,
        reason: locale.crossPost.reason,
        bypassIds: [],
        triggerLimit: 3,
        filterFiles: true
    },
    swearWords: {
        status: false,
        action: 3,
        reason: locale.swearWords.reason,
        bypassIds: []
    },
    invites: {
        status: false,
        action: 3,
        reason: locale.invites.reason,
        bypassIds: [],
        onDM: true
    },
    uppercase: {
        status: false,
        action: 3,
        reason: locale.uppercase.reason,
        bypassIds: [],
        percentage: 75,
        minimumLength: 50
    },
    links: {
        status: false,
        action: 3,
        reason: locale.links.reason,
        bypassIds: []
    },
    massEmojis: {
        status: false,
        action: 3,
        reason: locale.massEmojis.reason,
        bypassIds: [],
        quantity: 20
    },
    massMentions: {
        status: false,
        action: 3,
        reason: locale.massMentions.reason,
        bypassIds: [],
        quantity: 5
    },
    massSpoilers: {
        status: false,
        action: 3,
        reason: locale.massSpoilers.reason,
        bypassIds: [],
        quantity: 10
    },
    repeatedText: {
        status: false,
        action: 3,
        reason: locale.repeatedText.reason,
        bypassIds: [],
        maxRepetitions: 5
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('automodFilters', schema);
