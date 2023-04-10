//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para las advertencias de un miembro
const warnSchema = new mongoose.Schema({
    timestamp: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    moderatorId: {
        type: String,
        required: true
    }
});

//Crea un nuevo esquema para el perfil del miembro
const profileSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'profile',
        immutable: true
    },
    userId: {
        type: String,
        required: true, 
        unique: true,
        immutable: true
    },
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
        warns: [warnSchema]
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('profile', profileSchema);
