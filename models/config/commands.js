// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the commands
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'commands',
        immutable: true
    },
    forceNameLocale: String,
    chatCommands: {
        ban: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
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
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            anonymousMode: [String]
        },
        edit: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        infractions: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            canSeeAny: [String]
        },
        invitation: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        kick: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            reasonNotNeeded: [String],
            botsAllowed: [String]
        },
        leaderboard: {
            module: {
                type: String,
                default: 'engagement',
                immutable: true
            },
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
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
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
            module: {
                type: String,
                default: 'engagement',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        ping: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        poll: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            canEndAny: [String]
        },
        purge: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        report: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        rmwarn: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            removeAny: [String],
            reasonNotNeeded: [String]
        },
        roleinfo: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        run: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        send: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        serverinfo: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        slowmode: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
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
            module: {
                type: String,
                default: 'engagement',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        unban: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            reasonNotNeeded: [String]
        },
        untimeout: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            reasonNotNeeded: [String],
            removeAny: [String]
        },
        userinfo: {
            module: {
                type: String,
                default: 'utilities',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            },
            canSeeAny: [String]
        },
        warn: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
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
            module: {
                type: String,
                default: 'engagement',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        }
    },
    messageCommands: {
        removeAndWarn: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
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
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        }
    },
    userCommands: {
        reportMember: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
            enabled: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        warn: {
            module: {
                type: String,
                default: 'moderation',
                immutable: true
            },
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

// Generates a model from the scheme and exports it as a module
export default mongoose.model('commands', schema, 'configs');
