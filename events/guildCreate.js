exports.run = async (guild, client, locale) => {
    
    try {

        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size === 1) {

            //Almacena las traducciones del manejador de nueva guild
            const newGuildLocale = await require(`../resources/locales/${client.config.main.language}.json`).utils.lifecycle.newGuild;

            //Almacena la nueva configuración de la guild
            await require('../utils/lifecycle/newGuild.js').run(client, cachedGuilds.first(), newGuildLocale);

            //Notifica por consola que el bot se ha unido a la guild
            console.log(`${new Date().toLocaleString()} 》${client.functions.localeParser(locale.newGuild, { botUsername: client.user.username, guildName: guild.name })}.`);

        } else {

            //Lanza una advertencia por consola
            console.warn(`${new Date().toLocaleString()} 》${client.functions.localeParser(locale.justOneGuild, { botUsername: client.user.username })}.`);

            //Abandona la guild
            await guild.leave();
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};
