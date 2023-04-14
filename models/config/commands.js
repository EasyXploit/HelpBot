//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para los comandos
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'commands',
        immutable: true
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
                default: 86400000,
                required: true
            }
        },
        dm: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            anonymousMode: [String]
        },
        edit: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        infractions: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            canSeeAny: [String]
        },
        invitation: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        kick: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            reasonNotNeeded: [String],
            botsAllowed: [String]
        },
        leaderboard: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            hideNotPresent: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        timeout: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            unlimitedTime: [String],
            maxRegularTime: {
                type: Number,
                default: 86400000,
                required: true
            },
            reasonNotNeeded: [String],
            botsAllowed: [String]
        },
        notifications: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        ping: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        poll: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            canEndAny: [String]
        },
        purge: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        report: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        rmwarn: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            removeAny: [String],
            reasonNotNeeded: [String]
        },
        roleinfo: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        run: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        send: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        serverinfo: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        slowmode: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            unlimitedTime: [String],
            maxRegularSeconds: {
                type: Number,
                default: 30,
                required: true
            },
            reasonNotNeeded: [String]
        },
        stats: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        unban: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            reasonNotNeeded: [String]
        },
        untimeout: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            reasonNotNeeded: [String],
            removeAny: [String]
        },
        userinfo: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            canSeeAny: [String]
        },
        warn: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            minimumTimeDifference: {
                type: Number,
                default: 15000,
                required: true
            },
            unlimitedFrequency: [String]
        },
        xp: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        }
    },
    messageCommands: {
        removeAndWarn: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            minimumTimeDifference: {
                type: Number,
                default: 15000,
                required: true
            },
            unlimitedFrequency: [String]
        },
        reportMessage: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        }
    },
    userCommands: {
        reportMember: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        warn: {
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            minimumTimeDifference: {
                type: Number,
                default: 15000,
                required: true
            },
            unlimitedFrequency: [String]
        }
    },
    ignored: {
        chatCommands: [String],
        messageCommands: [String],
        userCommands: [String]
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo
export default mongoose.model('commands', schema, 'configs');
