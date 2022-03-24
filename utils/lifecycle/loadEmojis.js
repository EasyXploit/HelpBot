exports.run = async (client) => {

    try {

        //Crea un objeto para almacenar todos los customEmojis
        client.customEmojis = {

            //Carga en el cliente cada uno de los emojis personalizados
            greenTick:  await client.homeGuild.emojis.fetch(client.config.dynamic.customEmojis.greenTick) || '✅',
            redTick:    await client.homeGuild.emojis.fetch(client.config.dynamic.customEmojis.redTick) || '❌',
            orangeTick: await client.homeGuild.emojis.fetch(client.config.dynamic.customEmojis.orangeTick) || '⚠',
            grayTick:   await client.homeGuild.emojis.fetch(client.config.dynamic.customEmojis.grayTick) || '❕',
        };

        //Notifica la correcta carga de los emojis personalizados en el cliente
        console.log(' - [OK] Carga de customEmojis globales.');

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR:`, error.stack);
    };
};
