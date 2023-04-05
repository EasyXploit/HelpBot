//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'logging',
        immutable: true
    },
    warnedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    warnRemoved: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    mutedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    unmutedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    kickedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    kickedBot: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    bannedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    bannedBot: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    unbannedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    sentDM: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    pollStarted: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    pollEnded: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    purgedChannel: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    slowmodeChanged: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    experienceModified: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    memberJoined: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    botJoined: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    memberLeaved: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    voiceMoves: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    memberReports: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('logging', schema, 'configs');
