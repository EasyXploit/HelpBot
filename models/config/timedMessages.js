//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para un campo de un mensaje programado
const timedMessageButtonSchema = new mongoose.Schema({ 
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

//Crea un nuevo esquema para un botón de un mensaje programado
const timedMessageRowSchema = new mongoose.Schema({ 
    buttons: {
        type: [timedMessageButtonSchema],
        max: 5
    }
});

//Crea un nuevo esquema para un campo de un mensaje programado
const timedMessageFieldSchema = new mongoose.Schema({ 
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

//Crea un nuevo esquema para un mensaje programado
const timedMessageSchema = new mongoose.Schema({
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
            type: [timedMessageFieldSchema],
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
        type: [timedMessageRowSchema],
        max: 5
    }
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
