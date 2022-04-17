exports.run = async (event, client, locale) => {

    try {
        
        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size > 1) {    //Si la cantidad es superior a 1

            //Notifica que el bot no puede funcionar en más de una guild
            console.warn(`${new Date().toLocaleString()} 》${client.functions.localeParser(locale.justOneGuild, { botUsername: client.user.username })}.`);

            //Aborta el proceso de manera limpia
            process.exit();

        } else if (cachedGuilds.size === 0) {   //Si la cantidad es 0

            //Notifica que el bot está esperando a que sea unido a una guild
            return console.warn(`${new Date().toLocaleString()} 》${client.functions.localeParser(locale.waitingGuild, { botUsername: client.user.username })}.`);
        };
            
        //Comprueba si la config de la guild ya está almacenada o no
        if (!client.config.dynamic.homeGuild || client.config.dynamic.homeGuild !== cachedGuilds.first().id) {

            //Almacena las traducciones del manejador de nueva guild
            const newGuildLocale = await require(`../resources/locales/${client.config.main.language}.json`).utils.lifecycle.newGuild;

            //Almacena la nueva configuración
            await require('../utils/lifecycle/newGuild.js').run(client, cachedGuilds.first(), newGuildLocale);
            
        } else {

            //Almacena las traducciones de la función de carga del sistema
            const systemLoadLocale = await require(`../resources/locales/${client.config.main.language}.json`).utils.lifecycle.systemLoad;

            //Carga la config. en memoria y arranca el sistema
            await require('../utils/lifecycle/systemLoad.js').run(client, systemLoadLocale);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};
