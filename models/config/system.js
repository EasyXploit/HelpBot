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
    errorTracker: {
        enabled: {
            type: Boolean,
            default: true,
            required: true
        },
        sentry: {
            dsn: String,
            tracesSampleRate: {
                type: Number,
                default: 1.0,
                required: true
            }
        }
    },
    modules: {
        timers: {
            type: Boolean,
            default: true,
            required: true
        }
        //Hacer más módulos
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('system', schema, 'configs');
