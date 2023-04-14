//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para las advertencias de un miembro
const warnDataSchema = new mongoose.Schema({
    warnId: {
        type: String,
        required: true,
        inmutable: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    content: [String],
    executor: {
        type: {
            type: String,
            enum: ['system', 'bot', 'member'],
            required: true
        },
        memberId: String
    }
});

//Crea un nuevo esquema para el perfil del miembro
const profileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, 
        unique: true,
        immutable: true
    },
    stats: {
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
        }
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
        warnsHistory: [warnDataSchema],
    }
});

//Genera un modelo a partir del esquema y lo exporta como módulo
export default mongoose.model('profile', profileSchema);
