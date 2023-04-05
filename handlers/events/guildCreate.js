exports.run = async (guild, client, locale) => {
    
    try {

        //Omite si la guild es del propio bot
        if (guild.ownerId === client.user.id) return;

        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size === 1) {

            //Almacena la nueva configuración de la guild
            await require('../../lifecycle/newGuild.js').run(client, cachedGuilds.first());

            //Notifica por consola que el bot se ha unido a la guild
            logger.info(`${new Date().toLocaleString()} 》${await client.functions.utilities.parseLocale.run(locale.newGuild, { botUsername: client.user.username, guildName: guild.name })}.`);

        } else {

            //Lanza una advertencia por consola
            logger.info(await client.functions.utilities.parseLocale.run(locale.justOneGuild, { botUsername: client.user.username }));

            //Abandona la guild
            await guild.leave();
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
