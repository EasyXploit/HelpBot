//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'commands'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    forceNameLocale: String,
    chatCommands: {
        ban: {
            enabled: {
                type: Boolean,
                default: true
            },
            reasonNotNeeded: [String],
            botsAllowed: [String],
            canSoftBan: [String],
            unlimitedTime: [String],
            maxRegularTime: {
                type: Number,
                default: 86400000
            }
        },
        dm: {
            enabled: {
                type: Boolean,
                default: true
            },
            anonymousMode: [String]
        },
        edit: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        infractions: {
            enabled: {
                type: Boolean,
                default: true
            },
            canSeeAny: [String]
        },
        invitation: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        kick: {
            enabled: {
                type: Boolean,
                default: true
            },
            reasonNotNeeded: [String],
            botsAllowed: [String]
        },
        leaderboard: {
            enabled: {
                type: Boolean,
                default: true
            },
            hideNotPresent: {
                type: Boolean,
                default: true
            }
        },
        mute: {
            enabled: {
                type: Boolean,
                default: true
            },
            unlimitedTime: [String],
            maxRegularTime: {
                type: Number,
                default: 86400000
            },
            reasonNotNeeded: [String],
            botsAllowed: [String]
        },
        notifications: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        ping: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        poll: {
            enabled: {
                type: Boolean,
                default: true
            },
            canEndAny: [String]
        },
        purge: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        report: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        rmwarn: {
            enabled: {
                type: Boolean,
                default: true
            },
            removeAny: [String],
            reasonNotNeeded: [String]
        },
        roleinfo: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        run: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        send: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        serverinfo: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        slowmode: {
            enabled: {
                type: Boolean,
                default: true
            },
            unlimitedTime: [String],
            maxRegularSeconds: {
                type: Number,
                default: 30
            },
            reasonNotNeeded: [String]
        },
        stats: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        unban: {
            enabled: {
                type: Boolean,
                default: true
            },
            reasonNotNeeded: [String]
        },
        unmute: {
            enabled: {
                type: Boolean,
                default: true
            },
            reasonNotNeeded: [String],
            removeAny: [String]
        },
        userinfo: {
            enabled: {
                type: Boolean,
                default: true
            },
            canSeeAny: [String]
        },
        warn: {
            enabled: {
                type: Boolean,
                default: true
            },
            minimumTimeDifference: {
                type: Number,
                default: 15000
            },
            unlimitedFrequency: [String]
        },
        xp: {
            enabled: {
                type: Boolean,
                default: true
            }
        }
    },
    messageCommands: {
        removeAndWarn: {
            enabled: {
                type: Boolean,
                default: true
            },
            minimumTimeDifference: {
                type: Number,
                default: 15000
            },
            unlimitedFrequency: [String]
        },
        reportMessage: {
            enabled: {
                type: Boolean,
                default: true
            }
        }
    },
    userCommands: {
        reportMember: {
            enabled: {
                type: Boolean,
                default: true
            }
        },
        warn: {
            enabled: {
                type: Boolean,
                default: true
            },
            minimumTimeDifference: {
                type: Number,
                default: 15000
            },
            unlimitedFrequency: [String]
        }
    },
    ignored: {
        chatCommands: [String],
        messageCommands: [String],
        userCommands: [String]
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('commands', schema);
