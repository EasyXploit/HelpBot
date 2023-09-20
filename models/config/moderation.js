// Library to interact with the database
const mongoose = require('mongoose');

// Stores the locale configuration from the configuration file
const localeConfig = require('./config.json').locale;

// Stores the translations to the configured language
const locale = require(`./locales/${localeConfig}.json`).models.config.automodFilters;

// Creates a new scheme for the automod rules
const automodRuleSchema = new mongoose.Schema({ 
    action: {
        type: String,
        enum: ['timeout', 'kick', 'tempban', 'ban'],
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 5000
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    age: {
        type: Number,
        required: true,
        min: 5000
    }
});

// Creates a new scheme for the moderation
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
    bannedWords: [String],
    newMemberTimeDelimiter: {
        type: Number,
        default: 1800000,
        required: true
    },
    newInfractorBanDuration: {
        type: Number,
        default: 1209600000,
        required: true
    },
    attachFilteredMessages:  {
        type: Boolean,
        default: true,
        required: true
    },
    messageHistorySize: {
        type: Number,
        default: 10,
        min: 5,
        required: true
    },
    voiceMovesExcludedChannels: [String],
    automodRules: [automodRuleSchema],
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
        bannedWords: {
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
                default: locale.bannedWords.reason,
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

// Generates a model from the scheme and exports it as a module
export default mongoose.model('moderation', schema, 'configs');
