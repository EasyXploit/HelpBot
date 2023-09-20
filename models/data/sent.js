// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the delivery
const sentSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    messageId: String,
    lastSentTimestamp: Number
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('sent', sentSchema);
