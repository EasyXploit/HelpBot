//Carga la clase de emojis de Discord.js, para poder insertarlos en los mensajes
const { Emoji } = require('discord.js');

exports.run = async (client) => {

    try {

        //Almacena el ID de la aplicación del bot, a la que pertenecen los emojis
        const applicationId = client.application.id;

        //Almacena los nombres sin extensión de los archivos de emojis
        const localEmojis = client.fs.readdirSync('./resources/emojis/').filter(fileName => fileName.endsWith('.png')).map(fileName => fileName.replace('.png', ''));

        //Carga los emojis de la aplicación (Discord.js v13 no tiene un gestor para ellos, así que se piden directamente a la API)
        const remoteEmojis = (await client.api.applications(applicationId).emojis.get()).items;

        //Almacena los nombres de los emojis de la aplicación
        const remoteEmojiNames = remoteEmojis.map(emoji => emoji.name);

        //Por cada uno de los emojis locales
        for (const emojiName of localEmojis) {

            //Omite el emoji si la aplicación ya lo tiene
            if (remoteEmojiNames.includes(emojiName)) continue;

            //Convierte la imagen del emoji al formato que requiere la API
            const image = `data:image/png;base64,${client.fs.readFileSync(`./resources/emojis/${emojiName}.png`).toString('base64')}`;

            //Sube el emoji a la aplicación y lo añade a la lista
            remoteEmojis.push(await client.api.applications(applicationId).emojis.post({ data: { name: emojiName, image: image } }));
        };

        //Crea un objeto para almacenar los emojis en memoria
        client.customEmojis = {};

        //Almacena en memoria cada uno de los emojis de la aplicación
        for (const emoji of remoteEmojis) client.customEmojis[emoji.name] = new Emoji(client, emoji);

        //Notifica la correcta carga de los emojis personalizados en el cliente
        console.log(` - [OK] ${client.locale.lifecycle.loadEmojis.configLoaded}.`);

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${client.locale.lifecycle.loadEmojis.error}:`, error.stack);
    };
};
