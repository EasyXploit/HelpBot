const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema para la estadística de miembro
const statSchema = new mongoose.Schema({
    _id: String,
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    userId: String,
    experience: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    aproxVoiceTime: {
        type: Number,
        default: 0
    },
    messagesCount: {
        type: Number,
        default: 0
    },
    notifications: {
        public: {
            type: Boolean,
            default: true
        },
        private: {
            type: Boolean,
            default: true
        }
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('stats', statSchema);
