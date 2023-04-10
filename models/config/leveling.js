//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Crea un nuevo esquema para las recompensas por subir de nivel
const levelingRewardSchema = new mongoose.Schema({ 
    requiredLevel: {
        type: Number,
        required: true,
        min: 1
    },
    roles: {
        type: [String],
        required: true
    }
});

//Crea un nuevo esquema para el sistema de niveles
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'leveling',
        immutable: true
    },
    rewards: [levelingRewardSchema],
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

//Genera un modelo a partir del esquema y lo exporta como módulo
module.exports = mongoose.model('leveling', schema, 'configs');
