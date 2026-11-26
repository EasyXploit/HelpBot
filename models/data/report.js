// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new schema for the reports made by each member
const reportEntrySchema = new mongoose.Schema({
    reporterId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    channelId: String,
    timestamp: {
        type: Number,
        required: true
    }
});

// Creates a new schema for the reports
const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'resolved', 'dismissed'],
        default: 'pending',
        required: true
    },
    // Message of the report in the reports channel
    card: {
        channelId: String,
        messageId: String
    },
    // Reported user, and its details when the report was made
    target: {
        userId: String,
        joinedTimestamp: Number,
        voiceChannelId: String
    },
    // Reported message, and its content when the report was made
    message: {
        id: String,
        channelId: String,
        url: String,
        content: String,
        attachments: [{
            name: String,
            url: String,
            contentType: String
        }]
    },
    // Reports made by the members (several, if the same message was reported by different members)
    reports: [reportEntrySchema],
    // Member who is handling the report
    assigneeId: String,
    // Sanctions applied from the report
    actions: [{
        type: {
            type: String,
            enum: ['warn', 'deleteMessage', 'timeout', 'kick', 'ban'],
            required: true
        },
        moderatorId: String,
        reason: String,
        duration: Number,
        timestamp: Number,
        // Whether it was applied by the automatic moderation
        automatic: Boolean
    }],
    // Whether the automatic moderation already acted on this report
    autoModerated: {
        type: Boolean,
        default: false
    },
    // Requests of more information sent to the reporters, and their answers
    infoRequests: [{
        requestId: String,
        moderatorId: String,
        question: String,
        timestamp: Number,
        answers: [{
            reporterId: String,
            text: String,
            timestamp: Number
        }]
    }],
    // Replies sent to the reporters
    replies: [{
        moderatorId: String,
        text: String,
        timestamp: Number
    }],
    // Member who resolved or dismissed the report, and when
    closedById: String,
    closedTimestamp: Number,
    createdTimestamp: {
        type: Number,
        required: true
    }
});

// Generates a model from the schema and exports it as a module
export default mongoose.model('report', reportSchema);
