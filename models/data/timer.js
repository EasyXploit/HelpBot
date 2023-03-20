//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para los campos del embed
const fieldsSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true
    },
    value: { //{{memberCount}}
        type: String,
        required: true
    },
    inline: {
        type: Boolean,
        default: true
    }
});

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'timer',
        immutable: true
    },
    channelId: {
        type: String,
        required: true
    },
    interval: {
        type: Number,
        default: 86400000,
        required: true
    },
    weekDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5, 6, 7],
        required: true
    },
    minimumMessagesSinceLast: {
        type: Number,
        default: 5,
        required: true
    },
    content: String, //{{serverName}}
    embed: {
        enabled: {
            type: Boolean,
            default: true,
            required: true
        },
        color: String,
        title: String,
        fields: [fieldsSchema],
        footer: String
    },
    linkButton: {
        label: String,
        emoji: String,
        url: String
    },
    sentInfo: {
        timerHash: {
            type: String,
            required: true
        },
        messageId: {
            type: String,
            required: true
        },
        lastSentTimestamp: {
            type: String,
            required: true
        }
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('timer', schema);
