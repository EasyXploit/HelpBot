//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para la configuración general
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'system',
        immutable: true
    },
    discordToken: String,
    baseGuildId: String,
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

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('system', schema, 'configs');
