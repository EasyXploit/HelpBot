// Library to interact with the database
const mongoose = require('mongoose');

// Creates a new scheme for the rewards for leveling
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

// Creates a new scheme for the level system
const schema = new mongoose.Schema({
    docType: {
        type: String,
        default: 'leveling',
        immutable: true
    },
    // Whether the experience system is enabled
    experienceSystemEnabled: {
        type: Boolean,
        default: true,
        required: true
    },
    // Old setting of the whole statistics collection, only used as the default value of the setting of each statistic
    statisticsCollectionEnabled: {
        type: Boolean,
        default: true,
        required: true
    },
    // Whether the sent messages are counted
    collectMessagesCount: {
        type: Boolean,
        default: function () { return this.statisticsCollectionEnabled; },
        required: true
    },
    // Whether the voice time is counted
    collectVoiceTime: {
        type: Boolean,
        default: function () { return this.statisticsCollectionEnabled; },
        required: true
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
    // Whether the statistics (sent messages and voice time) of the members who leave are preserved
    preserveStats: {
        type: Boolean,
        default: true,
        required: true
    },
    // Whether the experience and the level of the members who leave are preserved (by default, the value of the old setting that preserved them with the statistics)
    preserveExperience: {
        type: Boolean,
        default: function () { return this.preserveStats; },
        required: true
    },
    removePreviousRewards: {
        type: Boolean,
        default: true,
        required: true
    }
});

// Generates a model from the scheme and exports it as a module
export default mongoose.model('leveling', schema, 'configs');
