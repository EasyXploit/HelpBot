//Exporta la función de manejo del evento
export default async (guild, locale) => {
    
    try {

        //Omite si la guild es del propio bot
        if (guild.ownerId === client.user.id) return;

        //Notifica el abandono de la guild
        logger.debug(`The bot has been removed from \"${guild.name}\"`);

        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Carga el ID de la guild de servicio
        const serviceGuildId = await client.functions.db.getConfig('system.serviceGuildId');

        //Almacena el número de guilds elegibles (descontando las de servicio)
        const elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        //Almacena el recuento de guilds elegibles
        let elegibleGuildsCount = elegibleGuilds.size;
        
        //Si no hay guilds
        if (elegibleGuildsCount === 0) {

            //Notifica que se debe volver a iniciar al bot
            logger.warn('The bot must be joined to a guild in order to work, so the program will finish and needs to be started again');

            //Aborta el proceso de manera limpia
            process.exit(0);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
