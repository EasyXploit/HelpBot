exports.run = async (client) => {

    //Carga los IDs de los emojis personalizados
    const customEmojis = require('../databases/customEmojis.json');

    //Crea un objeto para almacenar todos los customEmojis
    client.customEmojis = {

        //EMOJIS PERSONALIZADOS - GLOBALES
        greenTick:  await client.homeGuild.emojis.fetch(customEmojis.greenTick) || '✅',
        redTick:    await client.homeGuild.emojis.fetch(customEmojis.redTick) || '❌',
        orangeTick: await client.homeGuild.emojis.fetch(customEmojis.orangeTick) || '⚠',
        grayTick:   await client.homeGuild.emojis.fetch(customEmojis.grayTick) || '❕',
    };

    console.log(' - [OK] Carga de customEmojis globales.');
};
