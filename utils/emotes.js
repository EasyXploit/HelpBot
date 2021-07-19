exports.run = async (client) => {

    //Crea un objeto para almacenar todos los emotes
    client.emotes = {

        //EMOTES - GLOBALES
        greenTick:  await client.emojis.cache.get(client.config.emotes.greenTick) || '✅',
        redTick:    await client.emojis.cache.get(client.config.emotes.redTick) || '❌',
        orangeTick: await client.emojis.cache.get(client.config.emotes.orangeTick) || '⚠',
        grayTick:   await client.emojis.cache.get(client.config.emotes.grayTick) || '❕',
    };
};
