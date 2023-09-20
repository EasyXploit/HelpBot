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
    newMemberRoleId: String
});

// Generates a model from the schema and exports it as a module
export default mongoose.model('welcomes', schema, 'configs');
