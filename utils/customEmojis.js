exports.run = async (client) => {

    //Crea un objeto para almacenar todos los customEmojis
    client.customEmojis = {

        //EMOJIS PERSONALIZADOS - GLOBALES
        greenTick:  await client.emojis.cache.get(client.config.customEmojis.greenTick) || '✅',
        redTick:    await client.emojis.cache.get(client.config.customEmojis.redTick) || '❌',
        orangeTick: await client.emojis.cache.get(client.config.customEmojis.orangeTick) || '⚠',
        grayTick:   await client.emojis.cache.get(client.config.customEmojis.grayTick) || '❕',
    };

    console.log(' - [OK] Carga de customEmojis globales.');
};
