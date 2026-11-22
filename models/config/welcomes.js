// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the welcomes
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'welcomes',
        immutable: true
    },
    newMemberMode: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
        required: true
    },
    newBotRoleId: String,
    newMemberRoleId: String,
    // Welcome message sent to a channel of the guild
    publicWelcome: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        channelId: {
            type: String,
            default: ''
        },
        format: {
            type: String,
            enum: ['text', 'embed'],
            default: 'text',
            required: true
        },
        message: {
            type: String,
            default: ''
        },
        // Whether the welcomes missed while the bot was offline are sent: none, all, or only if they are not more than the limit
        recovery: {
            type: String,
            enum: ['none', 'all', 'limit'],
            default: 'none',
            required: true
        },
        recoveryLimit: {
            type: Number,
            default: 10,
            min: 1,
            required: true
        }
    },
    // Welcome message sent by private message to the member
    privateWelcome: {
        enabled: {
            type: Boolean,
            default: false,
            required: true
        },
        format: {
            type: String,
            enum: ['text', 'embed'],
            default: 'text',
            required: true
        },
        message: {
            type: String,
            default: ''
        },
        // Whether the welcomes missed while the bot was offline are sent
        recovery: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    // Join timestamp of the last member handled by the bot, to recover the joins that happened while it was offline
    lastHandledJoin: {
        type: Number,
        default: 0
    },
    // Members that have not accepted the rules yet, to recover the ones that accepted them while the bot was offline
    pendingMembers: [String]
});

// Generates a model from the schema and exports it as a module
export default mongoose.model('welcomes', schema, 'configs');
