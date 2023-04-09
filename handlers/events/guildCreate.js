exports.run = async (guild, locale) => {
    
    try {

        //Omite si la guild es del propio bot
        if (guild.ownerId === client.user.id) return;

        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size === 1) {

            //Almacena la nueva configuración de la guild
            await require('../../lifecycle/newGuild.js').run(cachedGuilds.first());

            //Notifica por consola que el bot se ha unido a la guild
            logger.debug(`The bot has been joined to \"${guild.name}\"`);

        } else {

            //Abandona la guild
            await guild.leave();

            //Lanza una advertencia por consola
            logger.debug(`The bot is not designed to work on more than one guild, so it quitted \"${guild.name}\"`);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
