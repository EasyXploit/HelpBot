//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para la guild
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'system',
        immutable: true
    },
    discordToken: String,
    homeGuildId: String,
    serviceGuildId: String,
    inviteCode: String,
    botManagers: [String],
    pingMsTreshold: {
        type: Number,
        default: 1000,
        required: true
    },
    modules: {
        timedMessages: {
            type: Boolean,
            default: false,
            required: true
        },
        memberReports: {
            type: Boolean,
            default: false,
            required: true
        }
        //Hacer más módulos
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('system', schema, 'configs');
