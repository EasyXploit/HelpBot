//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'logging'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    warnedMember: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    warnRemoved: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    mutedMember: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    unmutedMember: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    kickedMember: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    kickedBot: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    bannedMember: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    unbannedMember: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    sentDM: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    pollStarted: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    pollEnded: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    purgedChannel: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    slowmodeChanged: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    experienceModified: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    memberJoined: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    botJoined: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    memberLeaved: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    voiceMoves: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    },
    memberReports: {
        enabled: {
            type: Boolean,
            default: true
        },
        channelId: String
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('logging', schema);
