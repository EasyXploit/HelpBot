//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: String,
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    channelId: String,
    interval: {
        type: Number,
        default: 86400000
    },
    weekDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5, 6, 7]
    },
    minimumMessagesSinceLast: {
        type: Number,
        default: 5
    },
    content: String, //{{serverName}}
    embed: {
        enabled: {
            type: Boolean,
            default: true
        },
        color: String,
        title: String,
        fields: [
            {
                name: String,
                value: String, //{{memberCount}}
                inline: {
                    type: Boolean,
                    default: true
                }
            },
            {
                name: String,
                value: String,
                inline: {
                    type: Boolean,
                    default: true
                }
            }
        ],
        footer: String
    },
    linkButton: {
        label: String,
        emoji: String,
        url: String
    },
    sentInfo: {
        timerHash: String,
        messageId: String,
        lastSentTimestamp: String
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('timer', schema);
