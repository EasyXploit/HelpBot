//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Almacena las traducciones al idioma configurado
const locale = require('../../resources/locales/en-us.json').models.config.automodFilters;

//Crea un nuevo esquema para las reglas de automoderación
const automodRulesSchema = new mongoose.Schema({ 
    action: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    }
});

//Crea un nuevo esquema para las recompensas por subida de nivel
const levelingRewardsSchema = new mongoose.Schema({ 
    requiredLevel: {
        type: Number,
        required: true
    },
    roles: {
        type: [String],
        required: true
    }
});

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'moderation',
        immutable: true
    },
    kickOnBadUsername: {
        type: Boolean,
        default: true,
        required: true
    },
    newMemberForbiddenNames: [String],
    includeBannedWords:  {
        type: Boolean,
        default: false,
        required: true
    },
    newMemberTimeDelimiter: {
        type: Number,
        default: 1800000,
        required: true
    },
    newSpammerMemberBanDuration: {
        type: Number,
        default: 1209600000,
        required: true
    },
    attachFilteredMessages:  {
        type: Boolean,
        default: true,
        required: true
    },
    bannedWords: [String],
    messageHistorySize: {
        type: Number,
        default: 10,
        min: 5,
        required: true
    },
    voiceMovesExcludedChannels: [String],
    automodRules: [automodRulesSchema],
    levelingRewards: [levelingRewardsSchema],
    filters: {
        flood: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.flood.reason,
                required: true
            },
            bypassIds: [String],
            triggerLimit: {
                type: Number,
                default: 5,
                required: true
            },
            maxTimeBetween: {
                type: Number,
                default: 2000,
                required: true
            }
        },
        crossPost: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.crossPost.reason,
                required: true
            },
            bypassIds: [String],
            triggerLimit: {
                type: Number,
                default: 3,
                required: true
            },
            filterFiles: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        swearWords: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.swearWords.reason,
                required: true
            },
            bypassIds: [String]
        },
        invites: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.invites.reason,
                required: true
            },
            bypassIds: [String],
            onDM: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        uppercase: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.uppercase.reason,
                required: true
            },
            bypassIds: [String],
            percentage: {
                type: Number,
                default: 75,
                required: true
            },
            minimumLength: {
                type: Number,
                default: 50,
                required: true
            }
        },
        links: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.links.reason,
                required: true
            },
            bypassIds: [String]
        },
        massEmojis: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.massEmojis.reason,
                required: true
            },
            bypassIds: [String],
            quantity: {
                type: Number,
                default: 20,
                required: true
            }
        },
        massMentions: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.massMentions.reason,
                required: true
            },
            bypassIds: [String],
            quantity: {
                type: Number,
                default: 5,
                required: true
            }
        },
        massSpoilers: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.massSpoilers.reason,
                required: true
            },
            bypassIds: [String],
            quantity: {
                type: Number,
                default: 10,
                required: true
            }
        },
        repeatedText: {
            status: {
                type: Boolean,
                default: false,
                required: true
            },
            action: {
                type: Number,
                default: 3,
                min: 1,
                max: 3,
                required: true
            },
            reason: {
                type: String,
                default: locale.repeatedText.reason,
                required: true
            },
            bypassIds: [String],
            maxRepetitions: {
                type: Number,
                default: 5,
                required: true
            }
        }
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('moderation', schema, 'configs');
