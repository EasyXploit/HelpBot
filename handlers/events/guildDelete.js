exports.run = async (guild, client, locale) => {
    
    try {

        //Omite si la guild es del propio bot
        if (guild.ownerId === client.user.id) return;

        //Notifica el abandono de la guild
        logger.info(await client.functions.utilities.parseLocale.run(locale.abandonedGuild, { botUsername: client.user.username, guildName: guild.name }));

        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Si no hay guilds
        if (cachedGuilds.size === 0) {

            //Notifica que se debe volver a iniciar al bot
            logger.info(locale.shouldReboot);

            //Aborta el proceso de manera limpia
            process.exit();
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
