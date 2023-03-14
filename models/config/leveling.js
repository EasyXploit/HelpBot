//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'leveling'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    rewardMessages: {
        type: Boolean,
        default: true
    },
    rewardVoice: {
        type: Boolean,
        default: true
    },
    notifylevelUpOnChat: {
        type: Boolean,
        default: true
    },
    notifylevelUpOnVoice: {
        type: Boolean,
        default: true
    },
    wontEarnXP: [String],
    nonXPChannels: [String],
    XPGainInterval: {
        type: Number,
        default: 60000
    },
    minimumTimeBetweenMessages: {
        type: Number,
        default: 5000
    },
    minimumXpReward: {
        type: Number,
        default: 5
    },
    maximumXpReward: {
        type: Number,
        default: 15
    },
    preserveStats: {
        type: Boolean,
        default: true
    },
    removePreviousRewards: {
        type: Boolean,
        default: true
    }
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('leveling', schema);
