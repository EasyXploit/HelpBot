//Librería para interactuar con la BD
const mongoose = require('mongoose');

//Carga la configuración del repositorio
const packageConfig = require('../../package.json');

//
const automodRulesSchema = new mongoose.Schema({ 
    action: String,
    duration: Number,
    quantity: Number,
    age: Number
});

//
const levelingRewardsSchema = new mongoose.Schema({ 
    requiredLevel: Number,
    roles: [String]
});

//Crea un nuevo esquema
const schema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'moderation'
    },
    requiredVersion: {
        type: Number,
        default: packageConfig.version
    },
    kickOnBadUsername: {
        type: Boolean,
        default: true
    },
    newMemberForbiddenNames: [String],
    includeBannedWords:  {
        type: Boolean,
        default: false
    },
    newMemberTimeDelimiter: {
        type: Number,
        default: 1800000
    },
    newSpammerMemberBanDuration: {
        type: Number,
        default: 1209600000
    },
    attachFilteredMessages:  {
        type: Boolean,
        default: true
    },
    bannedWords: [String],
    messageHistorySize: {
        type: Number,
        default: 10
    },
    voiceMovesExcludedChannels: [String],
    automodRules: [automodRulesSchema],
    levelingRewards: [levelingRewardsSchema]
}, { 
    capped: { size: 2048, max: 1} 
});

//Añade el esquema al modelo
module.exports = mongoose.model('moderation', schema);
