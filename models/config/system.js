//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema para la guild
const guildSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'system'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    discordToken: String,
    homeGuildId: String,
    serviceGuildId: String,
    locale: {
        type: String,
        default: 'en-us'
    },
    inviteCode: String,
    botManagers: [String],
    errorTracker: {
        enabled: {
            type: Boolean,
            default: true
        },
        sentry: {
            dsn: String,
            tracesSampleRate: {
                type: Number,
                default: 1.0
            }
        }
    },
    modules: {
        timers: {
            type: Boolean,
            default: true
        }
        //Hacer más módulos
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('system', guildSchema);
