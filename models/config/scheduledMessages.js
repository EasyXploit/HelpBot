// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for a scheduled message field
const scheduledButtonBuilderSchema = new mongoose.Schema({ 
    label: {
        type: String,
        min: 1,
        max: 80
    },
    emoji: {
        type: String,
        min: 1,
        max: 1
    },
    url: {
        type: String,
        min: 10
    }
});

// Creates a new scheme for a scheduled message button
const scheduledMessageRowSchema = new mongoose.Schema({ 
    buttons: {
        type: [scheduledButtonBuilderSchema],
        max: 5
    }
});

// Creates a new scheme for a scheduled message field
const scheduledMessageFieldSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        min: 1,
        max: 256
    },
    value: {
        type: String,
        required: true,
        min: 1,
        max: 1024
    },
    inline: {
        type: Boolean,
        default: true
    }
});

// Creates a new scheme for a scheduled message
const scheduledMessageSchema = new mongoose.Schema({
    hash: {
        type: String
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    interval: {
        type: Number,
        default: 86400000,
        required: true,
        min: 300000
    },
    weekDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5, 6, 7],
        required: true
    },
    minimumMessagesSinceLast: {
        type: Number,
        default: 5
    },
    content: {
        type: String,
        min: 1,
        max: 4096
    },
    embed: {
        color: String,
        author: {
            name: {
                type: String,
                min: 1,
                max: 256
            },
            iconURL: {
                type: String,
                min: 1,
            },
            url: {
                type: String,
                min: 1,
            }
        },
        url: {
            type: String,
            min: 1,
        },
        thumbnail: {
            type: String,
            min: 1,
        },
        title: {
            type: String,
            min: 1,
            max: 256
        },
        description: {
            type: String,
            min: 1,
            max: 4096
        },
        fields: {
            type: [scheduledMessageFieldSchema],
            max: 25
        },
        image: {
            type: String,
            min: 1,
        },
        timestamp: {
            type: Boolean,
            default: false,
        },
        footer: {
            type: String,
            min: 1,
            max: 2048
        }
    },
    actionRows: {
        type: [scheduledMessageRowSchema],
        max: 5
    }
});

// Creates a new scheme for the scheduled messages
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'scheduledMessages',
        immutable: true
    },
    configuredMessages: [scheduledMessageSchema]
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('scheduledMessages', schema, 'configs');