//Importa los cargadores
import { newBaseGuild, loadSystem } from 'helpbot/loaders';

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
        let elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        //Almacena el recuento de guilds elegibles
        let elegibleGuildsCount = elegibleGuilds.size;

        //Comprueba cuantas guilds hay disponibles
        if (elegibleGuildsCount === 1) {

            //Notifica por consola que el bot se ha unido a la guild
            logger.debug(`The bot has been joined to "${guild.name}" (${guild.id})`);

            //Almacena la nueva configuración de la guild
            await newBaseGuild(cachedGuilds.first());

        } else {

            //Indica que el bot NO está listo para manejar eventos
            global.readyStatus = false;

            //Registra que el bot no puede funcionar en más de una guild
            logger.warn('User interaction was requested to choose which will be the new base guild, because the bot was added to a new guild. Meanwhile, the bot will not be able to handle events');

            //Muestra el selector de guild base
            const newElegibleGuilds = await client.functions.menus.baseGuildSelection(elegibleGuilds);

            //Actualiza el listado de guilds elegibles
            elegibleGuilds = newElegibleGuilds;

            //Carga el ID de la guild base
            const baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

            //Si no hay guild base, o la guild base no es la primera de la lista
            if (baseGuildId !== elegibleGuilds.first().id) {
                
                //Notifica por consola que se ha registrado una nueva guild base
                logger.debug(`A new base guild has been registered: ${elegibleGuilds.first().name} (${elegibleGuilds.first().id})`);

                //Registra una nueva guild base
                await newBaseGuild(elegibleGuilds.first());

            } else {

                //Carga la configuración en memoria y arranca el sistema
                await loadSystem(client.locale.lib.loaders.system);
            };
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
