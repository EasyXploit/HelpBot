exports.run = async (client) => {

    //Crea un objeto para almacenar todos los emotes
    client.emotes = {

        //EMOTES - GLOBALES
        greenTick:  await client.emojis.cache.get(client.config.emotes.greenTick) || '✅',
        redTick:    await client.emojis.cache.get(client.config.emotes.redTick) || '❌',
        orangeTick: await client.emojis.cache.get(client.config.emotes.orangeTick) || '⚠',
        grayTick:   await client.emojis.cache.get(client.config.emotes.grayTick) || '❕',

        //EMOTES - REPÚBLICA GAMER
        rg:         await client.emojis.cache.get('498288236607569962'),
        nitro:      await client.emojis.cache.get('496633448686157826'),
        rythm:      await client.emojis.cache.get('507187604031275008'),
        boxbot:     await client.emojis.cache.get('497178946149023744'),
        chevron1:   await client.emojis.cache.get('497133469110108189'),
        chevron2:   await client.emojis.cache.get('497133468791341116'),
        chevron3:   await client.emojis.cache.get('497133468741009411'),
        chevron4:   await client.emojis.cache.get('497133469059645460'),
        chevron5:   await client.emojis.cache.get('497133469529538560')
    };
};
