// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the general configuration
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'system',
        immutable: true
    },
    discordToken: String,
    baseGuildId: String,
    serviceGuildId: String,
    inviteCode: String,
    botManagers: [String],
    pingMsTreshold: {
        type: Number,
        default: 1000,
        required: true
    },
    modules: {
        scheduledMessages: {
            type: Boolean,
            default: false,
            required: true
        },
        memberReports: {
            type: Boolean,
            default: false,
            required: true
        }
        // Make more modules
    }
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('system', schema, 'configs');
