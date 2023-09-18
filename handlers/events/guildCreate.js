//Importa el cargador de sistema
import { newBaseGuild } from 'helpbot/loaders';

//Exporta la función de manejo del evento
export default async (guild, locale) => {
    
    try {

        //Omite si la guild es del propio bot
        if (guild.ownerId === client.user.id) return;

        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Carga el ID de la guild de servicio
        const serviceGuildId = await client.functions.db.getConfig('system.serviceGuildId');

        //Almacena el número de guilds elegibles (descontando las de servicio)
        const elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        //Almacena el recuento de guilds elegibles
        let elegibleGuildsCount = elegibleGuilds.size;

        //Comprueba cuantas guilds hay disponibles
        if (elegibleGuildsCount === 1) {

            //Notifica por consola que el bot se ha unido a la guild
            logger.debug(`The bot has been joined to \"${guild.name}\"`);

            //Almacena la nueva configuración de la guild
            await newBaseGuild(cachedGuilds.first());

        } else {

            //Abandona la guild
            await guild.leave();

            //Lanza una advertencia por consola
            logger.warn(`The bot is not designed to work on more than one guild, so it quitted \"${guild.name}\". If you want to use the bot on another guild, remove it from the previous one first`);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
