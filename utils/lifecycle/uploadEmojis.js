exports.run = async (client) => {

    try {

        //Almacena el umbral de emojis
        let emojisThreshold;

        //Calcula el umbral de emojis por tier de guild
        switch (client.homeGuild.premiumTier) {
            case 'NONE': emojisThreshold = 50; break;
            case 'TIER_1': emojisThreshold = 100; break;
            case 'TIER_2': emojisThreshold = 150; break;
            case 'TIER_3': emojisThreshold = 250; break;
        };

        //Listado de emojis normales (sin animar) de la guild
        const normalGuildEmojis = await client.homeGuild.emojis.fetch().then(emojis => emojis.filter(emoji => !emoji.animated).map(emoji => emoji.id));

        //Carga la configuración dinámica
        const dynamicConfig = require('../../configs/dynamic.json');

        //Carga el listado de emojis a cargar en la guild
        const customEmojis = dynamicConfig.customEmojis;

        //Carga cada una de las claves del objeto de emojis
        const emojis = Object.keys(customEmojis);

        //Creación de nuevos emojis en la guild
        if ((normalGuildEmojis.length + emojis.length) <= emojisThreshold) {

            //Almacena la cantidad de emojis añadidos
            newEmojisCount = 0;

            //Promesa para comprobar la existencia de los customEmojis, y crearlos en caso negativo
            const emojiCreation = new Promise(async (resolve, reject) => {

                //Para cada uno de los emojis de sistema
                for (index = 0; index < emojis.length; index++) {

                    //Almacena el nombre del emoji
                    const emojiName = emojis[index];

                    //Omite este emoji si ya está presente en la guild
                    if (!normalGuildEmojis.includes(customEmojis[emojiName])) {

                        //Crea el emoji
                        await client.homeGuild.emojis.create(`./resources/emojis/${emojiName}.png`, emojiName, `Necesario para el funcionamiento de ${client.user.username}.`)
                        .then(emoji => {

                            //Almacena el ID del emoji
                            customEmojis[emojiName] = emoji.id;

                            //Notifica por consola
                            console.log(`- ${client.functions.localeParser(client.locale.utils.lifecycle.uploadEmojis.emojiCreated, { emojiName: emoji.name })}.`);

                            //Aumenta el recuento de emojis creados
                            newEmojisCount++;
                        });
                    };

                    //Resuelve la promesa
                    if (index === emojis.length - 1) resolve();
                };
            });

            //Después de crear los emojis
            await emojiCreation.then(async () => {

                //Almacena los IDs en memoria
                dynamicConfig.customEmojis = customEmojis;

                //Almacena la configuración dinámica de emojis
                if (newEmojisCount > 0) await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(dynamicConfig, null, 4), async err => { if (err) throw err });
            });
        
        } else {

            //Devuelve un error por consola
            console.error(`\n${client.functions.localeParser(client.locale.utils.lifecycle.uploadEmojis.insufficientSpace, { neededSpaced: emojis.length })}.\n`);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${client.locale.utils.lifecycle.uploadEmojis.error}:`, error.stack);
    };
};
