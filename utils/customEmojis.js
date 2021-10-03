exports.run = async (client) => {

    //Carga los IDs de los emojis personalizados
    const customEmojis = require('../databases/customEmojis.json');

    //Crea un objeto para almacenar todos los customEmojis
    client.customEmojis = {

        //EMOJIS PERSONALIZADOS - GLOBALES
        greenTick:  await client.emojis.cache.get(customEmojis.greenTick) || '✅',
        redTick:    await client.emojis.cache.get(customEmojis.redTick) || '❌',
        orangeTick: await client.emojis.cache.get(customEmojis.orangeTick) || '⚠',
        grayTick:   await client.emojis.cache.get(customEmojis.grayTick) || '❕',
    };

    console.log(' - [OK] Carga de customEmojis globales.');
};
