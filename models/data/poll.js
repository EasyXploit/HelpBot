// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the surve
const pollSchema = new mongoose.Schema({
    pollId: {
        type: String,
        required: true, 
        unique: true
    },
    channelId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    options: {
        type: String,
        required: true
    },
    expirationTimestamp: Number
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('poll', pollSchema);