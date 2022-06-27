exports.run = async (event, client, locale) => {

    try {
        
        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size > 1) {    //Si la cantidad es superior a 1

            //Por cada guild en caché
            await cachedGuilds.forEach(guild => {
                
                //Omite la iteración si la guild es la configurada o es del propio bot
                if (guild.ownerId === client.user.id || guild.id === client.config.dynamic.homeGuild) return;

                //Notifica que el bot no puede funcionar en más de una guild
                console.warn(`\n${new Date().toLocaleString()} 》${locale.justOneGuild}.`);

                //Aborta el proceso de manera limpia
                process.exit();
            });

        } else if (cachedGuilds.size === 0) {   //Si la cantidad es 0

            //Notifica que el bot está esperando a que sea unido a una guild
            return console.warn(`\n${new Date().toLocaleString()} 》${locale.waitingGuild}.`);
        };
            
        //Comprueba si la config de la guild ya está almacenada o no
        if (!client.config.dynamic.homeGuild || client.config.dynamic.homeGuild !== cachedGuilds.first().id) {

            //Almacena la nueva configuración
            await require('../../lifecycle/newGuild.js').run(client, cachedGuilds.first());
            
        } else {

            //Carga la config. en memoria y arranca el sistema
            await require('../../lifecycle/loadSystem.js').run(client, client.locale.lifecycle.loadSystem);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};
