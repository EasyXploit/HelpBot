const filters = require('../configs/automodFilters.json');

//Palabras malsonantes
async function swearWords(message) {
    if (client.config.bannedWords.some(word => message.content.toLowerCase().includes(word))) return true;
};

//Invitaciones
async function invites(message) {

    //Filtra el texto en busca de códigos de invitación
    let detectedInvites = message.content.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s\/]+?(?=\b)/gm);

    //Si se encontraron invitaciones, se comprueba que no sean de la guild
    if (detectedInvites) {
        let legitInvites = 0;

        await message.guild.invites.fetch().then(guildInvites => {

            let inviteCodes = Array.from(guildInvites.keys());

            detectedInvites.forEach(filteredInvite => {
                inviteCodes.forEach(inviteCode => {
                    if (filteredInvite.includes(inviteCode)) legitInvites++;
                });
            });
        });

        if (legitInvites < detectedInvites.length) return true;
    };
};

//Mayúsculas
async function uppercase(message) {

    if (message.content.length < filters.uppercase.minimumLength) return false;
    if (message.content.replace(/[^A-Z]/g, '').length > (message.content.length / 100) * filters.uppercase.percentage) return true;
};

//Enlaces
async function links(message) {

    const urlRegex = RegExp('https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}');
    return urlRegex.test(message.content);
};

//Emojis masivos
async function massEmojis(message) {

    function fancyCount(str){
        return Array.from(str.split(/[\ufe00-\ufe0f]/).join('')).length;
    }

    let stringWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');
    let serverEmojis = message.content.match(/<:.+?:\d+>/g);
    if (serverEmojis) serverEmojis = serverEmojis.length;

    if ((((fancyCount(message.content) - fancyCount(stringWithoutUTFEmojis))) + serverEmojis) > filters.massEmojis.quantity) return true;
};

//Menciones masivas
async function massMentions(message) {

    let count = (message.content.match(/<@!?(\d+)>/g) || []).length;
    if (count > filters.massMentions.quantity) return true;
};

//Spoilers masivos
async function massSpoilers(message) {

    let count = (message.content.match(/\|\|.*?\|\|/g) || []).length;
    if (count > filters.massSpoilers.quantity) return true;
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
    massEmojis: massEmojis,
    massMentions: massMentions,
    massSpoilers: massSpoilers,
    repeatedText: repeatedText
}
