exports.run = async (event, client) => {

    try {
        
        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size > 1) {    //Si la cantidad es superior a 1

            //Notifica que el bot no puede funcionar en más de una guild
            console.error(`${new Date().toLocaleString()} 》ERROR: ${client.user.username} no está diseñado para funcionar en más de una guild (servidor).\nExpulse al bot del resto de guilds y reinicie al bot.`);

            //Aborta el proceso de manera limpia
            process.exit();

        } else if (cachedGuilds.size === 0) {   //Si la cantidad es 0

            //Notifica que el bot está esperando a que sea unido a una guild
            return console.warn(`${new Date().toLocaleString()} 》AVISO: Esperando a que ${client.user.username} se una a una guild.`);
        };
            
        //Comprueba si la config de la guild ya está almacenada o no
        if (!client.config.dynamic.homeGuild || client.config.dynamic.homeGuild !== cachedGuilds.first().id) {

            //Almacena la nueva configuración
            await require('../utils/storeNewGuildConfig.js').run(client, cachedGuilds.first());
            
        } else {

            //Carga la config. en memoria y arranca el sistema
            await require('../utils/systemLoad.js').run(client);
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};
