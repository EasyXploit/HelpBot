// Library to interact with the database
const mongoose = require('mongoose');

// Imports the function to obtain the path of the local configuration file
import configFile from '../../lib/utils/configFile.js';

// Stores the locale configuration from the configuration file
const localeConfig = require(configFile()).locale;

// Stores the translations to the configured language
const locale = require(`./locales/${localeConfig}.json`).models.config.automodFilters;

// Stores the default templates of the replies to the reporters, in the configured language
const replyTemplates = Object.values(require(`./locales/${localeConfig}.json`).models.config.reportReplyTemplates);

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
    // Whether automod is enabled
    automodEnabled: {
        type: Boolean,
        default: true,
        required: true
    },
    // Whether manual moderation is enabled
    manualModerationEnabled: {
        type: Boolean,
        default: true,
        required: true
    },
    // Settings of the reports sent by the members
    reports: {
        // Whether the reports are enabled
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        // Channel where the reports are sent
        channelId: {
            type: String,
            default: ''
        },
        // Roles to mention when a new report is received
        mentionRoles: [String],
        // Members and roles that can handle the reports (apart from the owner of the guild and the bot managers)
        handlers: [String],
        // Sanctions that can be applied from the reports
        quickActions: {
            type: [{
                type: String,
                enum: ['warn', 'deleteMessage', 'timeout', 'kick', 'ban']
            }],
            default: ['warn', 'deleteMessage', 'timeout', 'kick', 'ban']
        },
        // Durations of the timeouts that can be applied from the reports, in milliseconds
        timeoutDurations: {
            type: [Number],
            default: [300000, 3600000, 86400000, 604800000]
        },
        // Whether the reporters are notified when their report is resolved or dismissed
        notifyReporters: {
            type: Boolean,
            default: true,
            required: true
        },
        // Templates of the replies that can be sent to the reporters
        replyTemplates: {
            type: [String],
            default: replyTemplates
        },
        // Automatic moderation when several members report the same message or member
        autoModeration: {
            // When the same message is reported by several members
            messages: {
                enabled: {
                    type: Boolean,
                    default: true,
                    required: true
                },
                // Amount of different members that have to report it
                threshold: {
                    type: Number,
                    default: 3,
                    min: 2,
                    required: true
                },
                // Whether the message is deleted
                deleteMessage: {
                    type: Boolean,
                    default: true,
                    required: true
                },
                // Duration of the timeout of its author, in milliseconds (0 to not time it out)
                timeoutDuration: {
                    type: Number,
                    default: 0,
                    min: 0,
                    required: true
                }
            },
            // When the same member is reported by several members
            members: {
                enabled: {
                    type: Boolean,
                    default: false,
                    required: true
                },
                // Amount of different members that have to report it in the time window
                threshold: {
                    type: Number,
                    default: 3,
                    min: 2,
                    required: true
                },
                // Time window in which the reports are counted, in milliseconds
                timeWindow: {
                    type: Number,
                    default: 86400000,
                    min: 60000,
                    required: true
                },
                // Duration of the timeout of the member, in milliseconds
                timeoutDuration: {
                    type: Number,
                    default: 3600000,
                    min: 60000,
                    required: true
                }
            }
        },
        // Limits to avoid the abuse of the reports
        limits: {
            // Maximum amount of reports that a member can make in the time window (0 to disable the limit)
            maxReports: {
                type: Number,
                default: 5,
                min: 0,
                required: true
            },
            // Time window of the previous limit, in milliseconds
            timeWindow: {
                type: Number,
                default: 3600000,
                min: 60000,
                required: true
            },
            // Time that a member has to wait to report the same member again, in milliseconds (0 to disable it)
            sameMemberCooldown: {
                type: Number,
                default: 86400000,
                min: 0,
                required: true
            }
        }
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
