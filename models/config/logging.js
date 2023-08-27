//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para los logs
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
        channelId: {
            type: String,
            default: ''
        }
    },
    warnRemoved: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    timeoutedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: String
    },
    untimeoutedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    kickedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    kickedBot: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    bannedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    bannedBot: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    unbannedMember: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    sentDM: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    pollStarted: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    pollEnded: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    purgedChannel: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    slowmodeChanged: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    experienceModified: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    memberJoined: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    botJoined: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    memberLeaved: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    voiceMoves: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    },
    memberReports: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        }
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo por defecto
export default mongoose.model('logging', schema, 'configs');
