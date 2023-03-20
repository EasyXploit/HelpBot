const mongoose = require('mongoose');

//Crea un nuevo esquema para la estadística de miembro
const statSchema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'stat',
        immutable: true
    },
    userId: {
        type: String,
        required: true
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
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('stat', statSchema);
