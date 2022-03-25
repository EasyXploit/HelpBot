//Carga los filtros de automoderción
const filters = require('../../configs/automodFilters.json');

//Filtro de palabras malsonantes
async function swearWords(client, message) {
    
    //Almacena las palabras prohibidas
    const words = require('../../configs/bannedWords.json');

    //Comprueba si el mensaje contenía palabras prohibidas
    if (words.some(word => message.content.toLowerCase().includes(word))) return true;
};

//Filtro de invitaciones
async function invites(client, message) {

    //Filtra el texto en busca de códigos de invitación
    let detectedInvites = message.content.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s\/]+?(?=\b)/gm);

    //Si se encontraron invitaciones, se comprueba que no sean de la guild
    if (detectedInvites) {

        //Almacena el recuento de invitaciones legítimas
        let legitInvites = 0;

        //Almacena las invitaciones del servidor
        await client.homeGuild.invites.fetch().then(guildInvites => {

            //Crea un array con los códigos de invitación
            let inviteCodes = Array.from(guildInvites.keys());

            //Por cada invitación detectada en el mensaje
            detectedInvites.forEach(filteredInvite => {

                //Por cada código de invitación de la guild
                inviteCodes.forEach(inviteCode => {

                    //Comprueba si se trata de una invitación de esta guild
                    if (filteredInvite.includes(inviteCode)) legitInvites++;
                });
            });
        });

        //Comprueba si encontró una invitación que no era de la guild
        if (legitInvites < detectedInvites.length) return true;
    };
};

//Filtro de mayúsculas excesivas
async function uppercase(client, message) {

    //Comprueba si el mensaje alcanza la longitud mínima para ejecutar el filtro
    if (message.content.length < filters.uppercase.minimumLength) return false;

    //Comprueba si superan el umbral máximo permitido
    if (message.content.replace(/[^A-Z]/g, '').length > (message.content.length / 100) * filters.uppercase.percentage) return true;
};

//Filtro de  enlaces
async function links(client, message) {

    //Comprueba si el mensaje contiene un enlace
    const urlRegex = RegExp('https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}');

    //Devuelve "true" si lo contenía
    return urlRegex.test(message.content);
};

//Filtro de emojis masivos
async function massEmojis(client, message) {

    //Función para contar emojis
    function fancyCount(str) {

        //Devuelve la cantidad de emojis encontrada
        return Array.from(str.split(/[\ufe00-\ufe0f]/).join('')).length;
    };

    //Almacena una copia del mensaje sin emojis UTF
    const stringWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

    //Almacena los emojis de servidor encontrados
    let serverEmojis = message.content.match(/<:.+?:\d+>/g);

    //Si hubieron emojis de servidor, almacena su cantidad
    if (serverEmojis) serverEmojis = serverEmojis.length;

    //Almacena la cantidad total de emojis en el mensaje
    const count = (fancyCount(message.content) - fancyCount(stringWithoutUTFEmojis)) + serverEmojis;

    //Comprueba si superan el umbral máximo permitido
    if (count > filters.massEmojis.quantity) return true;
};

//Filtro de menciones masivas
async function massMentions(client, message) {

    //Cuenta las menciones del mensaje
    const count = (message.content.match(/<@!?(\d+)>/g) || []).length;

    //Comprueba si superan el umbral máximo permitido
    if (count > filters.massMentions.quantity) return true;
};

//Filtro de spoilers masivos
async function massSpoilers(client, message) {

    //Cuenta los spoilers del mensaje
    const count = (message.content.match(/\|\|.*?\|\|/g) || []).length;

    //Comprueba si superan el umbral máximo permitido
    if (count > filters.massSpoilers.quantity) return true;
};

//Filtro de texto repetitivo
async function repeatedText(client, message) {

    //Comprueba si el mensaje contenía texto repetitivo
    return /^(.+)(?: +\1){3}/.test(message.content);
};

//Exporta cada uno de los filtros
module.exports = {
    swearWords : swearWords,
    invites : invites,
    uppercase : uppercase,
    links : links,
    massEmojis: massEmojis,
    massMentions: massMentions,
    massSpoilers: massSpoilers,
    repeatedText: repeatedText
};
