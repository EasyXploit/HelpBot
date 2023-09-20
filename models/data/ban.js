
// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the ban
const banSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, 
        unique: true,
        immutable: true
    },
    moderatorId: {
        type: String,
        required: true
    },
    untilTimestamp: {
        type: Number,
        required: true
    }
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('ban', banSchema);
