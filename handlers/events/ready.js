exports.run = async (event,locale) => {

    try {
        
        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Carga el ID de la guild base
        const homeGuildId = client.config.dynamic.homeGuild;

        //Carga el ID de la guild de servicio
        const serviceGuildId = client.config.dynamic.serviceGuildId;

        //Almacena el número de guilds válidas (descontando las de servicio)
        const validGuildsCount = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);
        
        //Comprueba cuantas guilds hay disponibles
        if (validGuildsCount > 1) {    //Si la cantidad es superior a 1

            //Por cada guild en caché
            await cachedGuilds.forEach(async guild => {
                
                //Omite la iteración si la guild es la configurada o es del propio bot
                if (guild.id === serviceGuildId || guild.id === homeGuildId) return;

                //Elimina la guild si es del bot pero no es la de servicio almacenada
                if(guild.ownerId === client.user.id) return await guild.delete();

                //Notifica que el bot no puede funcionar en más de una guild
                console.warn(`\n${new Date().toLocaleString()} 》${locale.justOneGuild}.`);

                //Aborta el proceso de manera limpia
                process.exit();
            });

        } else if (validGuildsCount === 0) {   //Si la cantidad es 0

            //Notifica que el bot está esperando a que sea unido a una guild
            return console.warn(`\n${new Date().toLocaleString()} 》${locale.waitingGuild}.`);
        };
            
        //Comprueba si la config de la guild ya está almacenada o no
        if (!homeGuildId || homeGuildId !== cachedGuilds.first().id) {

            //Almacena la nueva configuración
            await require('../../lifecycle/newGuild.js').run(cachedGuilds.first());
            
        } else {

            //Carga la config. en memoria y arranca el sistema
            await require('../../lifecycle/loadSystem.js').run(client.locale.lifecycle.loadSystem);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};
