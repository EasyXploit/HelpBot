// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for a member's warnings
const warnDataSchema = new mongoose.Schema({
    warnId: {
        type: String,
        required: true,
        inmutable: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    content: [String],
    executor: {
        type: {
            type: String,
            enum: ['system', 'bot', 'member'],
            required: true
        },
        memberId: String
    }
});

// Creates a new scheme for the member's profile
const profileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, 
        unique: true,
        immutable: true
    },
    stats: {
        experience: {
            type: Number,
            default: 0,
            required: true
        },
        level: {
            type: Number,
            default: 0,
            required: true
        },
        aproxVoiceTime: {
            type: Number,
            default: 0,
            required: true
        },
        messagesCount: {
            type: Number,
            default: 0,
            required: true
        }
    },
    notifications: {
        public: {
            type: Boolean,
            default: true,
            required: true
        },
        private: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    moderationLog: {
        warnsHistory: [warnDataSchema],
    }
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('profile', profileSchema);
