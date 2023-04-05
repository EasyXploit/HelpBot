//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'leveling',
        immutable: true
    },
    rewards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'levelingReward'
    }],
    rewardMessages: {
        type: Boolean,
        default: true,
        required: true
    },
    rewardVoice: {
        type: Boolean,
        default: true,
        required: true
    },
    notifyLevelUpOnChat: {
        type: Boolean,
        default: true,
        required: true
    },
    notifyLevelUpOnVoice: {
        type: Boolean,
        default: true,
        required: true
    },
    wontEarnXP: [String],
    nonXPChannels: [String],
    XPGainInterval: {
        type: Number,
        default: 60000,
        required: true
    },
    minimumTimeBetweenMessages: {
        type: Number,
        default: 5000,
        required: true
    },
    minimumXpReward: {
        type: Number,
        default: 5,
        required: true
    },
    maximumXpReward: {
        type: Number,
        default: 15,
        required: true
    },
    preserveStats: {
        type: Boolean,
        default: true,
        required: true
    },
    removePreviousRewards: {
        type: Boolean,
        default: true,
        required: true
    }
});

//Añade el esquema al modelo
module.exports = mongoose.model('leveling', schema, 'configs');
