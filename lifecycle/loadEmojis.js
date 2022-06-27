exports.run = async (client) => {

    try {

        //Busca y almacena la guild de servicio para emojis
        client.serviceGuild = client.guilds.cache.get(client.config.dynamic.serviceGuildId);

        //Si no hay guild de servicio
        if (!client.serviceGuild) {

            //Crea y almacena la guild de servicio
            client.serviceGuild = await client.guilds.create(`${client.user.username}-serviceGuild`);

            //Almacena en la config. el ID de la guild de servicio
            client.config.dynamic.serviceGuildId = client.serviceGuild.id;

            //Sobreescribe la base de datos con los cambios
            await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
        };

        //Almacena los nombres originales de los archivos de emojis
        let fileNames = client.fs.readdirSync('./resources/emojis/');

        //Almacena los nombres sin extensión de los emojis
        let localEmojis = [];
        
        //Para cada archivo, almacena su nombre sin extensión en el array "localEmojis"
        for (let file = 0; file < fileNames.length; file ++) localEmojis.push(fileNames[file].replace('.png', ''));

        //Si se excede el límite de emojis, devuelve un error
        if (localEmojis.length > 50) return console.error(`${new Date().toLocaleString()} 》ERROR:`, client.locale.lifecycle.loadEmojis.maxExceeded);

        //Carga las emojis de la guild
        let remoteEmojis = await client.serviceGuild.emojis.fetch();

        //Por cada emoji de la guild
        await remoteEmojis.forEach(async emoji => {

            //Si no tiene un fichero local, se borra el emoji
            if (!localEmojis.includes(emoji.name)) await client.serviceGuild.emojis.delete(emoji);
        });

        //Almacena los nombres de los emojis de la guild
        const remoteEmojiNames = remoteEmojis.map(emoji => emoji.name);

        //Por cada uno de los emojis locales
        for (let index = 0; index < localEmojis.length; index++) {

            //Almacena el nombre del emoji
            const emojiName = localEmojis[index];

            //Si el emoji no está en la guild, lo sube
            if (!remoteEmojiNames.includes(emojiName)) await client.serviceGuild.emojis.create(`./resources/emojis/${emojiName}.png`, emojiName);
        };

        //Actualiza los emojis de la guild en memoria
        remoteEmojis = await client.serviceGuild.emojis.fetch();

        //Crea un objeto para almacenar los emojis en memoria
        client.customEmojis = {};

        //Por cada uno de los emojis de la guild
        await remoteEmojis.forEach(emoji => {

            //Lo almacena en memoria
            client.customEmojis[emoji.name] = emoji;
        });

        //Notifica la correcta carga de los emojis personalizados en el cliente
        console.log(` - [OK] ${client.locale.lifecycle.loadEmojis.configLoaded}.`);

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${client.locale.lifecycle.loadEmojis.error}:`, error.stack);
    };
};
