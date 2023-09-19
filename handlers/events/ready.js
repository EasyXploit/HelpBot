//Importa los cargadores
import { newBaseGuild, loadSystem } from 'helpbot/loaders';

//URL de ayuda para unir el bot a una guild
const waitingNewGuildHelpURL = 'https://github.com/EasyXploit/HelpBot/wiki/Starting#-joining-the-bot';

//Exporta la función de manejo del evento
export default async (event, locale) => {

    try {
        
        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Muestra por consola una lista de las guilds a las que el bot está unido
        logger.debug('List of guilds the bot is attached to');
        await cachedGuilds.forEach(async guild => {
            logger.debug(`⤷ ${guild.name} (${guild.id})`);
        });

        //Carga el ID de la guild base
        let baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

        //Carga el ID de la guild de servicio
        const serviceGuildId = await client.functions.db.getConfig('system.serviceGuildId');

        //Almacena el número de guilds elegibles (descontando las de servicio)
        let elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        //Almacena el recuento de guilds elegibles
        let elegibleGuildsCount = elegibleGuilds.size;
        
        //Comprueba cuantas guilds hay disponibles
        if (elegibleGuildsCount > 1) { //Si la cantidad es superior a 1

            //Por cada guild en caché
            await elegibleGuilds.forEach(async guild => {

                //Si la guild es del bot
                if(guild.ownerId === client.user.id) {

                    try {

                        //Decrementa el recuento de guild elegibles
                        elegibleGuildsCount--;
    
                        //Elimina la guild
                        return await guild.delete();
                        
                    } catch (error) {

                        //Muestra un error en la consola
                        logger.error(error.stack);
                    };
                };
            });

        } else if (elegibleGuildsCount === 0) { //Si la cantidad es 0

            //Notifica que el bot está esperando a que sea unido a una guild
            console.log(`\n⏳ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHeader, { botUsername: client.user.username })} ...`);
            console.log(`❔ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHelp, { waitingNewGuildHelpURL: waitingNewGuildHelpURL })}\n`);
            
            //Finaliza enviando un mensaje de depuración a la consola
            return logger.debug('Waiting for the bot to be joined to a guild');
        };

        //Si el recuento de guilds elegibles es exáctamente 1
        if (elegibleGuildsCount !== 1) {

            //Registra que el bot no puede funcionar en más de una guild
            logger.warn('User interaction was requested to choose which will be the new base guild, because the bot was in several guilds');

            //Muestra el selector de guild base
            const newElegibleGuilds = await client.functions.menus.baseGuildSelection(elegibleGuilds);

            //Actualiza el listado de guilds elegibles
            elegibleGuilds = newElegibleGuilds;
        };

        //Si no hay guild base, o la guild base no es la primera de la lista
        if (!baseGuildId || baseGuildId !== elegibleGuilds.first().id) {
            
            //Notifica por consola que se ha registrado una nueva guild base
            logger.debug(`A new base guild has been registered: ${elegibleGuilds.first().name} (${elegibleGuilds.first().id})`);

            //Registra una nueva guild base
            await newBaseGuild(elegibleGuilds.first());

        } else {

            //Carga la configuración en memoria y arranca el sistema
            await loadSystem(client.locale.lib.loaders.system);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
