// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the presence
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'presence',
        immutable: true
    },
    showText: String,
    membersCount: {
        type: Boolean,
        default: true,
        required: true
    },
    status: {
        type: String,
        default: 'online',
        enum: ['online', 'idle', 'offline', 'dnd'],
        required: true
    },
    type: {
        type: String,
        default: 'WATCHING',
        enum: ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM', 'COMPETING']
    }
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('presence', schema, 'configs');
