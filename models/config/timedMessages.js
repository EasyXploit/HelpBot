//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para un campo de un mensaje programado
const timedMessageFieldSchema = new mongoose.Schema({ 
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

//Crea un nuevo esquema para un mensaje programado
const timedMessageSchema = new mongoose.Schema({
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
    content: String, //{{serverName}}
    embed: {
        enabled: {
            type: Boolean,
            default: true,
            required: true
        },
        color: String,
        title: String,
        fields: [timedMessageFieldSchema],
        footer: String
    },
    linkButton: {
        label: String,
        emoji: String,
        url: String
    },
    messageHash: String
});

//Crea un nuevo esquema para los mensajes programados
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'timedMessages',
        immutable: true
    },
    configuredMessages: [timedMessageSchema]
});

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('timedMessages', schema, 'configs');
