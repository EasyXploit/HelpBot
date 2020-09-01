const filters = require(`../../utils/automod/filters.json`);

//Palabras malsonantes
async function swearWords(message) {

    const words = require('../../resources/texts/swearWords.json');
    if (words.some(word => message.content.toLowerCase().includes(word))) return true;
};

//Invitaciones
async function invites(message) {
    
    const invites = ['discord.gg', '.gg/', '.gg /', '. gg /', '. gg/', 'discord .gg /', 'discord.gg /', 'discord .gg/', 'discord .gg', 'discord . gg', 'discord. gg', 'discord gg', 'discordgg', 'discord gg /'];
    if (invites.some(word => message.content.toLowerCase().includes(word))) return true;
};

//Mayúsculas
async function uppercase(message) {

    if (message.content.length < 15) return false;
    if (message.content.replace(/[^A-Z]/g, "").length > (message.content.length / 100) * 75) return true;
};

//Enlaces
async function links(message) {

    const urlRegex = RegExp('https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}');
    return urlRegex.test(message.content);
};

//Emojis masivos
async function massEmoji(message) {

    function fancyCount(str){
        return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
    }

    let stringWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, "");
    let serverEmojis = message.content.match(/<:.+?:\d+>/g);
    if (serverEmojis) serverEmojis = serverEmojis.length;

    if ((((fancyCount(message.content) - fancyCount(stringWithoutUTFEmojis))) + serverEmojis) > filters.massEmoji.quantity) return true;
};

//Menciones masivas
async function massMentions(message) {

    let count = (message.content.match(/<@!?(\d+)>/g) || []).length;
    if (count > filters.massMentions.quantity) return true;
};

//Spoilers masivos
async function massiveSpoilers(message) {

    let count = (message.content.match(/\|\|.*?\|\|/g) || []).length;
    if (count > filters.massiveSpoilers.quantity) return true;
};

//Texto repetitivo
async function repeatedText(message) {
    
    // Experimental
    // /^\s*(.+?)(\s*\1\s*)+$/

    return /^(.+)(?: +\1){3}/.test(message.content);
};


module.exports = {
    swearWords : swearWords,
    invites : invites,
    uppercase : uppercase,
    links : links,
    massEmoji: massEmoji,
    massMentions: massMentions,
    massiveSpoilers: massiveSpoilers,
    repeatedText: repeatedText
}
